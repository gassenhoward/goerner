<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "goerner_crm";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(["erfolg" => false, "meldung" => "DB-Verbindungsfehler: " . $e->getMessage()]);
    exit();
}

$action = $_GET['action'] ?? '';

// --------------------------------------------------------------------------
// POST-HANDLER (Formulare)
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input) {
        $input = $_POST;
    }

    $formType = $input['formType'] ?? '';

    // A) KONTAKTFORMULAR (index.html)
    if ($formType === 'kontakt') {
        if (empty($input['name']) || empty($input['email'])) {
            echo json_encode(["erfolg" => false, "meldung" => "Name und E-Mail erforderlich."]);
            exit();
        }
        $stmt = $pdo->prepare("INSERT INTO anfragen (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['name'],
            $input['email'],
            $input['phone'] ?? null,
            $input['subject'] ?? null,
            $input['message'] ?? null
        ]);

        $mailSubject = "Neue CRM-Kontaktanfrage: " . ($input['subject'] ?? 'Allgemein');
        $mailBody = "Name: " . $input['name'] . "\nE-Mail: " . $input['email'] . "\nTelefon: " . ($input['phone'] ?? '-') . "\n\nNachricht:\n" . ($input['message'] ?? '-');
        $headers = "From: no-reply@druckerei-goerner.de\r\nReply-To: " . $input['email'] . "\r\nContent-Type: text/plain; charset=UTF-8";
        @mail("info@druckerei-goerner.de", $mailSubject, $mailBody, $headers);

        echo json_encode(["erfolg" => true, "meldung" => "Kontaktanfrage erfolgreich gespeichert!"]);
        exit();
    }

    // B) VINYL-KONFIGURATOR (vinyl.html)
    if ($formType === 'vinyl') {
        if (empty($input['name']) || empty($input['email'])) {
            echo json_encode(["erfolg" => false, "meldung" => "Name und E-Mail erforderlich."]);
            exit();
        }

        $filePath = null;
        if (!empty($input['fileData']) && !empty($input['fileName'])) {
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileParts = explode(',', $input['fileData']);
            $decoded = base64_decode(end($fileParts));
            $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $input['fileName']);
            file_put_contents($uploadDir . $safeName, $decoded);
            $filePath = 'uploads/' . $safeName;
        }

        $stmt = $pdo->prepare("INSERT INTO vinyl_anfragen 
            (name, firma_band, projektname, email, phone, stueckzahl, projekt_zusammenfassung, drive_link, transfer_link, message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $input['name'],
            $input['firmaBand'] ?? null,
            $input['projektname'] ?? null,
            $input['email'],
            $input['phone'] ?? null,
            $input['stueckzahl'] ?? null,
            $input['projektZusammenfassung'] ?? null,
            $filePath,
            $input['datenlink'] ?? null,
            $input['message'] ?? null
        ]);

        $vinylSubject = "Neue CRM-Vinyl-Anfrage: " . ($input['projektname'] ?? 'Vinyl-Projekt') . " - " . $input['name'];
        $vinylBody = "Kunde: " . $input['name'] . " (" . $input['email'] . ")\nFirma/Band: " . ($input['firmaBand'] ?? '-') . "\n\nSpezifikationen:\n" . ($input['projektZusammenfassung'] ?? '-') . "\n\nUpload: " . ($filePath ?? 'Keine') . "\nLink: " . ($input['datenlink'] ?? 'Kein') . "\n\nNachricht:\n" . ($input['message'] ?? '-');
        $vinylHeaders = "From: no-reply@druckerei-goerner.de\r\nReply-To: " . $input['email'] . "\r\nContent-Type: text/plain; charset=UTF-8";
        @mail("vinyl@druckerei-goerner.de", $vinylSubject, $vinylBody, $vinylHeaders);

        echo json_encode(["erfolg" => true, "meldung" => "Vinyl-Spezifikation erfolgreich gespeichert!"]);
        exit();
    }

    // C) COOKIE CONSENT
    if ($formType === 'cookie_consent') {
        echo json_encode(["erfolg" => true, "meldung" => "Cookie Consent geloggt."]);
        exit();
    }
}

// --------------------------------------------------------------------------
// GET-HANDLER (Dashboard & Abfragen)
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getRequests') {
        $stmt = $pdo->query("SELECT id, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as timestamp, name as kunde, projektname as projekt, email, projekt_zusammenfassung as zusammenfassung, status FROM vinyl_anfragen ORDER BY id DESC LIMIT 50");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    if ($action === 'getJobs') {
        $stmt = $pdo->query("SELECT id as rowId, title as titel, department as abteilung, type as art, description as beschreibung FROM stellenangebote WHERE status = 'Aktiv' ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }
}

echo json_encode(["erfolg" => false, "meldung" => "Ungültige Anfrage."]);

// D) STATUS-UPDATE FÜR CRM-DASHBOARD
    if ($action === 'updateStatus' || ($input['action'] ?? '') === 'updateStatus') {
        $id = $input['id'] ?? null;
        $status = $input['status'] ?? null;
        $table = ($input['type'] ?? '') === 'kontakt' ? 'anfragen' : 'vinyl_anfragen';

        if ($id && $status) {
            $stmt = $pdo->prepare("UPDATE {$table} SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(["erfolg" => true, "meldung" => "Status erfolgreich aktualisiert."]);
            exit();
        }
        echo json_encode(["erfolg" => false, "meldung" => "Ungültige Parameter."]);
        exit();
    }