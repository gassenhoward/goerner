// ==========================================================================
// CLIENT-SIDE CRM CORE & MUTATION MECHANICS (js/dashboard.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("requestsTable") || document.getElementById("panel-jobs")) {
        initDashboard();
    }
});

/**
 * Initialisiert die asynchronen Feeds des Dashboards
 */
function initDashboard() {
    loadRequests();
    loadLiveJobs();
}

/**
 * Holt die Anfragen über die PHP/MySQL-Schnittstelle
 */
function loadRequests() {
    fetch('/api/index.php?action=getRequests')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#requestsTable tbody");
            if (!tbody) return;
            
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Keine Anfragen vorhanden.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(r => `
                <tr>
                    <td><span class="text-white-50 small">${r.timestamp}</span></td>
                    <td><strong class="text-white">${r.kunde}</strong></td>
                    <td><span class="text-info">${r.projekt || '-'}</span></td>
                    <td><div class="small text-light p-2 rounded" style="white-space: pre-wrap; line-height: 1.4; background-color: #0f172a; border: 1px solid #334155;">${r.zusammenfassung || '-'}</div></td>
                    <td><span class="badge ${r.status === 'Neu' ? 'bg-danger' : 'bg-warning'}">${r.status}</span></td>
                </tr>
            `).join('');
        })
        .catch(err => {
            const tbody = document.querySelector("#requestsTable tbody");
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Fehler beim Laden der Datenbank-Daten.</td></tr>';
            }
        });
}

/**
 * Übermittelt ein neues Stellenangebot an die MySQL-Datenbank
 */
function submitJob() {
    const t = document.getElementById("jobTitle").value;
    const d = document.getElementById("jobDept").value;
    const ty = document.getElementById("jobType").value;
    const de = document.getElementById("jobDesc").value;
    
    if (!t || !de) {
        alert("Bitte Titel und Beschreibung ausfüllen.");
        return;
    }

    const payload = {
        action: "saveJob",
        title: t,
        department: d,
        type: ty,
        description: de
    };
    
    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        const alertBox = document.getElementById("jobAlert");
        alertBox.className = "alert " + (res.erfolg ? "alert-success" : "alert-danger");
        alertBox.textContent = res.meldung;
        alertBox.classList.remove("d-none");
        if (res.erfolg) {
            document.getElementById("jobTitle").value = "";
            document.getElementById("jobDesc").value = "";
            loadLiveJobs();
        }
    })
    .catch(() => alert("Fehler beim Speichern des Stellenangebots."));
}

/**
 * Lädt die aktiven Stellenangebote aus der MySQL-Datenbank
 */
function loadLiveJobs() {
    fetch('/api/index.php?action=getJobs')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("liveJobsList");
            if (!list) return;

            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML = '<p class="text-muted small text-center my-3">Keine aktiven Angebote auf der Live-Webseite.</p>';
                return;
            }
            
            list.innerHTML = data.map(j => `
                <div class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center p-3 mb-2">
                    <div>
                        <h6 class="mb-1 fw-bold text-magenta">${j.titel}</h6>
                        <small class="text-white-50">${j.abteilung} · ${j.art}</small>
                    </div>
                    <button onclick="removeJobLive('${j.rowId}')" class="btn btn-sm btn-outline-danger px-3">Entfernen</button>
                </div>
            `).join('');
        })
        .catch(() => {
            const list = document.getElementById("liveJobsList");
            if (list) list.innerHTML = '<p class="text-danger small text-center">Fehler beim Laden der Stellenangebote.</p>';
        });
}

/**
 * Deaktiviert ein Stellenangebot in der MySQL-Datenbank
 */
function removeJobLive(rowId) {
    if (!confirm("Möchten Sie dieses Stellenangebot wirklich live entfernen?")) return;
    
    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "deleteJob", id: rowId })
    })
    .then(res => res.json())
    .then(res => {
        if (res.erfolg) {
            loadLiveJobs();
        } else {
            alert("Fehler beim Löschen: " + res.meldung);
        }
    })
    .catch(() => alert("Fehler bei der Verbindung zum Server."));
}

/**
 * Synchronisiert Webseiten-Assets mit dem lokalen Webserver-Speicher
 */
function uploadImageAsset() {
    const fileInput = document.getElementById("imageFile");
    const targetId = document.getElementById("imageTargetId").value;
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        fetch('/api/index.php', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "uploadAsset",
                fileData: reader.result,
                fileName: file.name,
                targetId: targetId
            })
        })
        .then(res => res.json())
        .then(res => {
            const alertBox = document.getElementById("imageAlert");
            alertBox.className = "alert " + (res.erfolg ? "alert-success" : "alert-danger");
            alertBox.textContent = res.erfolg ? "Asset erfolgreich aktualisiert!" : res.meldung;
            alertBox.classList.remove("d-none");
        })
        .catch(() => alert("Fehler beim Datei-Upload."));
    };
}

/**
 * Führt den Login-Vorgang über die PHP-Session aus
 */
function performLogin() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    
    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "login", username: u, password: p })
    })
    .then(res => res.json())
    .then(res => {
        if (res && res.erfolg) {
            window.location.href = "/Dashboard.html";
        } else {
            const ab = document.getElementById("alertBox");
            ab.textContent = res.meldung;
            ab.classList.remove("d-none");
        }
    })
    .catch(() => alert("Login-Server nicht erreichbar."));
}

/**
 * Bricht die PHP-Session ab
 */
function logout() {
    fetch('/api/index.php?action=logout')
        .then(() => {
            window.location.href = "/Login.html";
        });
}