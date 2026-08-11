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
$username = "DEIN_MYSQL_BENUTZER"; // z. B. root
$password = "DEIN_MYSQL_PASSWORT"; // eintragen

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
// POST-HANDLER (Formular-Übermittlungen)
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $formType = $input['formType'] ?? '';

    // A) KONTAKTFORMULAR
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
        
        mail("satz@druckerei-goerner.de", "CRM: Neue Kontaktanfrage", "Name: {$input['name']}\nE-Mail: {$input['email']}\n\nNachricht:\n{$input['message']}");
        echo json_encode(["erfolg" => true, "meldung" => "Kontaktanfrage gespeichert!"]);
        exit();
    }

    // B) VINYL-KONFIGURATOR
    if ($formType === 'vinyl') {
        if (empty($input['name']) || empty($input['email'])) {
            echo json_encode(["erfolg" => false, "meldung" => "Name und E-Mail erforderlich."]);
            exit();
        }

        // Dateiupload-Verarbeitung (Speicherung auf Server statt Google Drive)
        $filePath = null;
        if (!empty($input['fileData']) && !empty($input['fileName'])) {
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            
            $fileData = explode(',', $input['fileData']);
            $decoded = base64_decode($fileData[1]);
            $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $input['fileName']);
            file_put_contents($uploadDir . $safeName, $decoded);
            $filePath = 'https://' . $_SERVER['HTTP_HOST'] . '/uploads/' . $safeName;
        }

        $stmt = $pdo->prepare("INSERT INTO vinyl_anfragen 
            (name, firma_band, projektname, email, phone, rueckenbreite, veredelung, kartonsorte, farbigkeit, sonderfarbe_details, grammatur, dispersion_cello, inside_out, extras, stueckzahl, drive_link, transfer_link, message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $input['name'],
            $input['firmaBand'] ?? null,
            $input['projektname'] ?? null,
            $input['email'],
            $input['phone'] ?? null,
            $input['rueckenbreite'] ?? null,
            $input['veredelung'] ?? null,
            $input['kartonsorte'] ?? null,
            $input['farbigkeit'] ?? null,
            $input['sonderfarbeDetails'] ?? null,
            $input['grammatur'] ?? null,
            $input['dispersionCello'] ?? null,
            !empty($input['insideOut']) ? 1 : 0,
            $input['extras'] ?? null,
            $input['stueckzahl'] ?? null,
            $filePath,
            $input['datenlink'] ?? null,
            $input['message'] ?? null
        ]);

        mail("satz@druckerei-goerner.de", "CRM: Neue Vinyl-Anfrage", "Projekt: {$input['projektname']}\nKunde: {$input['name']}");
        echo json_encode(["erfolg" => true, "meldung" => "Vinyl-Spezifikation erfolgreich gespeichert!"]);
        exit();
    }
}

// --------------------------------------------------------------------------
// GET-HANDLER (CRM-Dashboard & Statusabfragen)
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // A) GET ANFRAGEN FÜR DASHBOARD
    if ($action === 'getRequests') {
        $stmt = $pdo->query("SELECT id, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as timestamp, name as kunde, projektname as projekt, email, CONCAT_WS(' | ', rueckenbreite, kartonsorte, farbigkeit) as zusammenfassung, status FROM vinyl_anfragen ORDER BY id DESC LIMIT 50");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // B) GET STELLENANGEBOTE FÜR FRONTEND & BACKEND
    if ($action === 'getJobs') {
        $stmt = $pdo->query("SELECT id as rowId, title as titel, department as abteilung, type as art, description as beschreibung FROM stellenangebote WHERE status = 'Aktiv' ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // C) AUFTRAGSSTATUS ABFRAGE
    if ($action === 'getStatus') {
        $nr = $_GET['auftragsnummer'] ?? '';
        $stmt = $pdo->prepare("SELECT auftragsnummer, projektname, status, DATE_FORMAT(liefertermin, '%d.%m.%Y') as liefertermin FROM auftraege WHERE UPPER(auftragsnummer) = UPPER(?)");
        $stmt->execute([$nr]);
        $res = $stmt->fetch();
        
        if ($res) {
            echo json_encode(["erfolg" => true, "meldung" => "Auftrag gefunden.", "daten" => $res]);
        } else {
            echo json_encode(["erfolg" => false, "meldung" => "Auftragsnummer nicht gefunden."]);
        }
        exit();
    }
}