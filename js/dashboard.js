// ==========================================================================
// CLIENT-SIDE CRM CORE & MUTATION MECHANICS (js/dashboard.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("requestsTable") || document.getElementById("panel-jobs") || document.getElementById("vinylTableBody")) {
        initDashboard();
    }
});

function initDashboard() {
    loadVinylRequests();
    loadKontaktRequests();
    loadLiveJobs();
}

/**
 * Lädt Vinyl-Anfragen mit interaktivem Status-Dropdown
 */
function loadVinylRequests() {
    fetch('/api/index.php?action=getRequests')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("vinylTableBody");
            if (!tbody) return;
            
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Keine Vinyl-Anfragen vorhanden.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(r => `
                <tr>
                    <td><span class="small text-muted">${r.timestamp}</span></td>
                    <td><strong class="text-dark">${r.kunde}</strong></td>
                    <td><span class="badge bg-info">${r.projekt || '-'}</span></td>
                    <td><div class="small p-2 rounded bg-light border text-secondary" style="white-space: pre-wrap; max-height: 120px; overflow-y: auto;">${r.zusammenfassung || '-'}</div></td>
                    <td><span class="small text-muted">System</span></td>
                    <td>
                        <select class="form-select form-select-sm fw-bold ${getStatusClass(r.status)}" onchange="updateRequestStatus(${r.id}, this.value, 'vinyl')">
                            <option value="Neu" ${r.status === 'Neu' ? 'selected' : ''}>🔴 Neu</option>
                            <option value="In Bearbeitung" ${r.status === 'In Bearbeitung' ? 'selected' : ''}>🟡 In Bearbeitung</option>
                            <option value="Erledigt" ${r.status === 'Erledigt' ? 'selected' : ''}>🟢 Erledigt</option>
                        </select>
                    </td>
                    <td><button onclick="deleteRequest(${r.id}, 'vinyl')" class="btn btn-sm btn-outline-danger">✕</button></td>
                </tr>
            `).join('');
        })
        .catch(() => {
            const tbody = document.getElementById("vinylTableBody");
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Fehler beim Laden der Vinyl-Daten.</td></tr>';
        });
}

/**
 * Lädt allgemeine Kontaktanfragen
 */
function loadKontaktRequests() {
    fetch('/api/index.php?action=getKontaktRequests')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("kontaktTableBody");
            if (!tbody) return;
            
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Keine Kontaktanfragen vorhanden.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(r => `
                <tr>
                    <td><span class="small text-muted">${r.timestamp}</span></td>
                    <td><strong class="text-dark">${r.name}</strong></td>
                    <td><span class="small">${r.email}<br>${r.phone || ''}</span></td>
                    <td><div class="small p-2 rounded bg-light border"><strong>${r.subject || ''}:</strong> ${r.message || ''}</div></td>
                    <td><span class="small text-muted">System</span></td>
                    <td>
                        <select class="form-select form-select-sm fw-bold ${getStatusClass(r.status)}" onchange="updateRequestStatus(${r.id}, this.value, 'kontakt')">
                            <option value="Neu" ${r.status === 'Neu' ? 'selected' : ''}>🔴 Neu</option>
                            <option value="In Bearbeitung" ${r.status === 'In Bearbeitung' ? 'selected' : ''}>🟡 In Bearbeitung</option>
                            <option value="Erledigt" ${r.status === 'Erledigt' ? 'selected' : ''}>🟢 Erledigt</option>
                        </select>
                    </td>
                    <td><button onclick="deleteRequest(${r.id}, 'kontakt')" class="btn btn-sm btn-outline-danger">✕</button></td>
                </tr>
            `).join('');
        })
        .catch(() => {
            const tbody = document.getElementById("kontaktTableBody");
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Fehler beim Laden der Kontakt-Daten.</td></tr>';
        });
}

/**
 * Aktualisiert den Status einer Anfrage per REST-API
 */
function updateRequestStatus(id, newStatus, type) {
    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "updateStatus", id: id, status: newStatus, type: type })
    })
    .then(res => res.json())
    .then(res => {
        if (!res.erfolg) alert("Fehler: " + res.meldung);
    })
    .catch(() => alert("Server-Verbindungsfehler beim Status-Update."));
}

function getStatusClass(status) {
    if (status === 'Neu') return 'border-danger text-danger bg-danger-subtle';
    if (status === 'In Bearbeitung') return 'border-warning text-warning-emphasis bg-warning-subtle';
    return 'border-success text-success bg-success-subtle';
}

function submitJob() {
    const t = document.getElementById("jobTitle").value;
    const d = document.getElementById("jobDept").value;
    const ty = document.getElementById("jobType").value;
    const de = document.getElementById("jobDesc").value;
    
    if (!t || !de) {
        alert("Bitte Titel und Beschreibung ausfüllen.");
        return;
    }

    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "saveJob", title: t, department: d, type: ty, description: de })
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
    });
}

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
                <div class="list-group-item bg-white border d-flex justify-content-between align-items-center p-3 mb-2 shadow-sm rounded">
                    <div>
                        <h6 class="mb-1 fw-bold text-magenta">${j.titel}</h6>
                        <small class="text-muted">${j.abteilung} · ${j.art}</small>
                    </div>
                    <button onclick="removeJobLive('${j.rowId}')" class="btn btn-sm btn-outline-danger px-3">Entfernen</button>
                </div>
            `).join('');
        });
}

function removeJobLive(rowId) {
    if (!confirm("Möchten Sie dieses Stellenangebot wirklich live entfernen?")) return;
    fetch('/api/index.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "deleteJob", id: rowId })
    })
    .then(res => res.json())
    .then(res => {
        if (res.erfolg) loadLiveJobs();
        else alert("Fehler: " + res.meldung);
    });
}

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
            window.location.href = "Dashboard.html";
        } else {
            const ab = document.getElementById("alertBox");
            ab.textContent = res.meldung;
            ab.classList.remove("d-none");
        }
    });
}

function logout() {
    fetch('/api/index.php?action=logout').then(() => { window.location.href = "Login.html"; });
}