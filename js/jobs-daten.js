// AUSBILDUNGSPLÄTZE (Inhalte fest aus den Flyern eingepflegt – ohne PDF-Verweise)
const AUSBILDUNGEN = [
    {
        titel: "Ausbildung zum Medientechnologe Druckverarbeitung (m/w/d)",
        abteilung: "Weiterverarbeitung / Postpress",
        art: "Ausbildung",
        beschreibung: "Verwandle bedruckte Papierbögen in fertige, exklusive Produkte. Du erlernst das Schneiden, Falzen, Heißfolienprägen und maschinelle Konfigurieren.",
        aufgaben: [
            "Verarbeiten von bereits gedruckten Produkten",
            "Maschinen und moderne Weiterverarbeitungsanlagen einrichten, rüsten und bedienen",
            "Überwachen von komplexen Produktionsprozessen",
            "Versandfertige Endprodukte herstellen sowie Mess- und Prüftätigkeiten durchführen"
        ],
        profil: [
            "Guter Realschulabschluss oder qualifizierter Hauptschulabschluss",
            "Technisches Verständnis und handwerkliche Sorgfalt",
            "Beobachtungsgenauigkeit, Aufmerksamkeit und gute Konzentration",
            "Entscheidungsfähigkeit und Reaktionsgeschwindigkeit bei der Maschinenführung"
        ]
    },
    {
        titel: "Ausbildung zum Medientechnologe Druck (m/w/d)",
        abteilung: "Produktion / Bogenoffset",
        art: "Ausbildung",
        beschreibung: "Lerne das Handwerk an den großen Maschinen. Du steuerst hochmoderne, mehrfarbige Bogenoffsetmaschinen von König & Bauer.",
        aufgaben: [
            "Das Bedienen, Konfigurieren und Rüsten von Bogenoffsetdruckmaschinen",
            "Exaktes Farbmischen nach vorgegebenen Spezifikationen (Pantone, HKS, CMYK)",
            "Laufende Kontrolle der Produktionsprozesse und Druckergebnisse",
            "Vollständiges und selbstständiges Steuern komplexer Druckanlagen"
        ],
        profil: [
            "Mittlere Reife oder qualifizierter/erweiterter Hauptschulabschluss",
            "Hohes Maß an Zuverlässigkeit, Genauigkeit und Sorgfalt",
            "Gutes Farbsehvermögen und technisches Grundverständnis",
            "Belastbarkeit, ganzheitliches Denken und schnelle Reaktionsgeschwindigkeit"
        ]
    },
    {
        titel: "Ausbildung zum Mediengestalter Digital und Print – Fachrichtung Print (m/w/d)",
        abteilung: "Prepress / Druckvorstufe",
        art: "Ausbildung",
        beschreibung: "Gestalte Layouts und bereite Daten perfekt für den Druck vor. Du verbindest Kreativität mit technischem Know-how und begleitest Projekte vom Entwurf bis zur fertigen Druckdatei.",
        aufgaben: [
            "Gestaltung und Satz von Printmedien wie Flyern, Broschüren, Katalogen und Geschäftsausstattungen",
            "Prüfung, Aufbereitung und Optimierung von Kundendaten für den Druck (Preflight)",
            "Erstellung von druckfertigen PDF-Dateien nach Industriestandards (PDF/X)",
            "Umgang mit den Programmen der Adobe Creative Cloud (InDesign, Photoshop, Illustrator)"
        ],
        profil: [
            "Gute Mittlere Reife, Fachhochschulreife oder Abitur",
            "Kreativität, ein gutes Auge für Farben, Formen und Typografie",
            "Sorgfältige, strukturierte Arbeitsweise und logisches Denkvermögen",
            "Gute Computerkenntnisse und idealerweise erste Erfahrungen mit Grafikprogrammen"
        ]
    }
];

// REGULÄRE STELLENANGEBOTE (Aktuell leer – Vorlage auskommentiert)
const JOBS = [
    /* 
    {
        titel: "Name der Stelle (m/w/d)",
        abteilung: "z.B. Produktion / Weiterverarbeitung / Prepress",
        art: "Vollzeit / Teilzeit",
        beschreibung: "Kurzer, einladender Beschreibungstext über die Position.",
        aufgaben: [
            "Erste Aufgabe",
            "Zweite Aufgabe",
            "Dritte Aufgabe",
            "Vierte Aufgabe"
        ],
        profil: [
            "Erste Anforderung / Ausbildung",
            "Zweite Anforderung / Kenntnisse",
            "Dritte Anforderung / Soft Skills",
            "Vierte Anforderung"
        ]
    }
    */
];

// Generierung des ausklappbaren Layouts im einheitlichen Stil
document.addEventListener("DOMContentLoaded", function() {
    const ausbildungContainer = document.getElementById("ausbildung-raster");
    const jobsContainer = document.getElementById("jobs-raster");

    function renderSection(datenArray, zielContainer, prefix) {
        if (!zielContainer) return;
        if (datenArray.length === 0) {
            zielContainer.innerHTML = '<div class="col-12 text-center py-3"><p class="text-muted small">Aktuell keine offenen Positionen in diesem Bereich.</p></div>';
            return;
        }

        zielContainer.innerHTML = datenArray.map((item, index) => `
            <div class="col-12 mb-4">
                <div class="card border-0 bg-light shadow-sm p-4 text-start border-start border-magenta border-4">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 border-bottom pb-3 mb-3">
                        <div>
                            <span class="text-magenta small fw-bold text-uppercase">${item.abteilung} · ${item.art}</span>
                            <h3 class="fw-bold fs-4 mt-1 mb-0">${item.titel}</h3>
                        </div>
                        <button class="btn btn-sm btn-outline-magenta px-4 mt-2 mt-md-0 text-nowrap" type="button" data-bs-toggle="collapse" data-bs-target="#${prefix}Details${index}">
                            Details einblenden
                        </button>
                    </div>
                    <p class="text-muted mb-0">${item.beschreibung}</p>
                    
                    <!-- Detail-Akkordeon -->
                    <div class="collapse mt-4" id="${prefix}Details${index}">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <h5 class="fw-bold text-dark mb-2 fs-6">Deine Aufgaben / Was du lernst:</h5>
                                <ul class="text-muted small ps-3">
                                    ${item.aufgaben.map(aufgabe => `<li class="mb-1">${aufgabe}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h5 class="fw-bold text-dark mb-2 fs-6">Dein Profil / Anforderungen:</h5>
                                <ul class="text-muted small ps-3">
                                    ${item.profil.map(punkt => `<li class="mb-1">${punkt}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="mt-4 pt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            <span class="text-muted small">Interesse geweckt? Sende deine Bewerbung einfach per Mail!</span>
                            <a href="mailto:info@druckerei-goerner.de?subject=Bewerbung: ${encodeURIComponent(item.titel)}" class="btn btn-magenta btn-sm px-4 fw-bold">Jetzt bewerben</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderSection(AUSBILDUNGEN, ausbildungContainer, "ausbildung");
    renderSection(JOBS, jobsContainer, "job");
});