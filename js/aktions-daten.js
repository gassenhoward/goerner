const AKTUELLE_AKTION = [
    {
        titel: "Kalenderkärtchen 2026",
        subtitel: "Exklusive Sammelform-Aktion · Scheckkartenformat",
        bild: "img/kalenderaktion2026.png",
        beschreibung: "Bringen Sie Ihre Werbung direkt ins Portemonnaie Ihrer Kunden. Unsere beliebten Taschenkalender (86 x 54 mm) bestechen durch robusten 350 g/m² Bilderdruckkarton, beidseitig hochglänzende Cellophanierung und präzise abgerundete Ecken.",
        highlights: [
            "<strong>Feste Drucktermine:</strong> Abgabe bis 08. Sept. (Lieferung ab 06. Okt.) oder bis 13. Okt.",
            "<strong>Farbliche Abstimmung:</strong> Das Kalendarium wird exakt an Ihr Vorderseiten-Design angepasst.",
            "<strong>Schulferien inklusive:</strong> Wahlweise farbig unterlegt für Sachsen, Thüringen oder Bayern.",
            "<strong>Professioneller Check:</strong> Kostenfreie Datenprüfung nach strengem PSO-Standard (300 dpi, 2 mm Anschnitt)."
        ]
    }
];

window.openActionFlyout = function() {
    const flyout = document.querySelector(".action-flyout");
    const overlay = document.querySelector(".action-overlay");
    if (flyout && overlay) {
        flyout.classList.add("open");
        overlay.classList.add("show");
    }
};

document.addEventListener("DOMContentLoaded", function() {
    if (AKTUELLE_AKTION.length === 0) return;
    const aktion = AKTUELLE_AKTION[0];

    const tab = document.createElement("div");
    tab.className = "action-sticky-tab";
    tab.innerHTML = "Kalender-Aktion 2026"; // Tab Name
    
    const overlay = document.createElement("div");
    overlay.className = "action-overlay";

    const flyout = document.createElement("div");
    flyout.className = "action-flyout text-start";
    flyout.innerHTML = `
        <div class="action-cover-container">
            <img src="${aktion.bild}" alt="Görner Kalenderkärtchen Aktion" class="action-hero-img" onerror="this.src='https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80';">
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3 p-2 rounded-circle" id="close-action-flyout" aria-label="Schließen"></button>
        </div>
        
        <div class="action-flyout-body">
            <div class="mb-2">
                <span class="text-magenta small fw-bold text-uppercase tracking-wider d-block mb-1">${aktion.subtitel}</span>
                <h3>${aktion.titel}</h3>
            </div>
            
            <p class="text-secondary">${aktion.beschreibung}</p>
            
            <div class="action-details-card">
                <h4>Aktions-Details</h4>
                <div class="d-flex flex-column">
                    ${aktion.highlights.map(punkt => `
                        <div class="action-info-row">
                            <span class="action-info-icon">✦</span>
                            <span class="text-muted">${punkt}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mt-3">
                <a href="mailto:info@druckerei-goerner.de?subject=Anfrage: Kalenderkaertchen Aktion 2026" class="btn btn-magenta btn-action-xxl text-center w-100 d-block">
                    Jetzt per E-Mail anfragen
                </a>
                <div class="d-flex justify-content-between align-items-center mt-3 text-white-50 small">
                    <span>Persönliche Beratung:</span>
                    <a href="tel:+4937152910" class="text-white fw-bold text-decoration-none">0371 5291-0</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(tab);
    document.body.appendChild(overlay);
    document.body.appendChild(flyout);

    function toggleFlyout() {
        flyout.classList.toggle("open");
        overlay.classList.toggle("show");
    }

    tab.addEventListener("click", toggleFlyout);
    overlay.addEventListener("click", toggleFlyout);
    document.getElementById("close-action-flyout").addEventListener("click", toggleFlyout);
});