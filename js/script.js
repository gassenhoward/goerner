document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. INTRO ANIMATION & CHRONIK-STACK ROTATOR (MULTISINGULAR RESILIENT)
    // ==========================================================================
    setTimeout(() => {
        const vinylWrapper = document.getElementById("heroVinylWrapper");
        const workstationWrapper = document.getElementById("heroWorkstationWrapper");
        const packagingStage = document.getElementById("heroPackagingStage");
        const heroText = document.querySelector(".hero-text-entry");
        const modernMachine = document.getElementById("heroModernMachine");

        if (vinylWrapper) {
            vinylWrapper.classList.add("loaded");
            setTimeout(() => { vinylWrapper.classList.add("spinning"); }, 2200);
        }

        if (modernMachine) {
            modernMachine.style.opacity = "1";
            modernMachine.style.transform = "scale(1)";
            const cylinders = modernMachine.querySelectorAll('.print-cylinder');
            if (cylinders.length > 0) {
                cylinders.forEach((cyl, index) => {
                    setTimeout(() => { cyl.classList.add('ignited'); }, 300 + (index * 250));
                });
            }
        }
        
        if (workstationWrapper) { workstationWrapper.classList.add("loaded"); }
        if (packagingStage) { packagingStage.classList.add("loaded"); }
        if (heroText) { heroText.classList.add("visible"); }
        
        // --- CHRONIK FOTO-STACK NATIVE ROTATIONS-ENGINE ---
        const photoStack = document.getElementById("historicalPhotoStack");
        const btnNext = document.getElementById("btnNextPhoto");
        
        if (photoStack) {
            let isRotating = false;

            function rotateChronikStack() {
                if (isRotating) return;
                
                const cards = Array.from(photoStack.querySelectorAll(".historical-photo-card"));
                if (cards.length === 0) return;

                // Das aktuelle Top-Element isolieren
                const topCard = cards.find(card => card.classList.contains("pos-1"));
                if (!topCard) return;

                isRotating = true;
                topCard.classList.add("swipe-out");

                // Nach Abschluss der Swipe-Animation (650ms laut CSS) Klassen rotieren
                setTimeout(() => {
                    cards.forEach(card => {
                        if (card.classList.contains("pos-1")) {
                            card.classList.remove("pos-1");
                            card.classList.add("pos-6");
                        } else if (card.classList.contains("pos-2")) {
                            card.classList.remove("pos-2");
                            card.classList.add("pos-1");
                        } else if (card.classList.contains("pos-3")) {
                            card.classList.remove("pos-3");
                            card.classList.add("pos-2");
                        } else if (card.classList.contains("pos-4")) {
                            card.classList.remove("pos-4");
                            card.classList.add("pos-3");
                        } else if (card.classList.contains("pos-5")) {
                            card.classList.remove("pos-5");
                            card.classList.add("pos-4");
                        } else if (card.classList.contains("pos-6")) {
                            card.classList.remove("pos-6");
                            card.classList.add("pos-5");
                        }
                    });

                    topCard.classList.remove("swipe-out");
                    isRotating = false;
                }, 650);
            }

            // Klick-Kopplung direkt auf den Stapel
            photoStack.addEventListener("click", function(e) {
                e.preventDefault();
                rotateChronikStack();
            });

            // Klick-Kopplung auf den Aktions-Button
            if (btnNext) {
                btnNext.addEventListener("click", function (e) {
                    e.preventDefault();
                    rotateChronikStack();
                });
            }
        }
    }, 300);

    // ==========================================================================
    // 2. VISUELLE KACHELN: INTERAKTIVES EINBLENDEN DER MENGEN UND EXTRAS
    // ==========================================================================
    const produktCheckboxes = [
        "Produkt_Kastentasche_12", "Produkt_Kastentasche_10", "Produkt_Kastentasche_7",
        "Produkt_Gatefold_12", "Produkt_Innentasche_12", "Produkt_Innentasche_10", "Produkt_Innentasche_7"
    ];

    produktCheckboxes.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.addEventListener("change", function () {
                const detailDiv = document.getElementById("details_" + id);
                if (detailDiv) {
                    if (this.checked) {
                        detailDiv.classList.remove("d-none");
                    } else {
                        detailDiv.classList.add("d-none");
                        const inputs = detailDiv.querySelectorAll("input, select, textarea");
                        inputs.forEach(input => {
                            if (input.type === "checkbox" || input.type === "radio") {
                                input.checked = false;
                            } else {
                                input.value = "";
                            }
                        });
                    }
                }
                aktualisiereGesamtmengeSichtbarkeit();
            });
        }
    });

    function aktualisiereGesamtmengeSichtbarkeit() {
        const gesamtMengeDiv = document.getElementById("gesamtmenge_block");
        if (!gesamtMengeDiv) return;
        
        const irgendeinProduktAktiv = produktCheckboxes.some(id => {
            const cb = document.getElementById(id);
            return cb ? cb.checked : false;
        });

        if (irgendeinProduktAktiv) {
            gesamtMengeDiv.classList.remove("d-none");
        } else {
            gesamtMengeDiv.classList.add("d-none");
        }
    }

    // ==========================================================================
    // 3. REAKTIVE MITTELLOCH-MATRIX FÜR LABELS & EINLEGER
    // ==========================================================================
    const extraLabels = document.getElementById("Extra_Schallplatten_Labels");
    const extraEinleger = document.getElementById("Extra_Einleger_Booklets");
    const mittellochOptionenBlock = document.getElementById("mittelloch_optionen_block");
    const optLochZentr = document.getElementById("optLochZentr");
    const optLochOpt = document.getElementById("optLochOpt");

    function checkHoleMatrix() {
        const labelsAktiv = extraLabels ? extraLabels.checked : false;
        const einlegerAktiv = extraEinleger ? extraEinleger.checked : false;

        if (labelsAktiv || einlegerAktiv) {
            if (optLochZentr) optLochZentr.checked = false;
            if (optLochOpt) optLochOpt.checked = false;
            if (mittellochOptionenBlock) mittellochOptionenBlock.classList.add("d-none");
        } else {
            if (mittellochOptionenBlock) mittellochOptionenBlock.classList.remove("d-none");
        }
    }

    if (extraLabels) extraLabels.addEventListener("change", checkHoleMatrix);
    if (extraEinleger) extraEinleger.addEventListener("change", checkHoleMatrix);
    if (optLochZentr) optLochZentr.addEventListener("change", checkHoleMatrix);
    if (optLochOpt) optLochOpt.addEventListener("change", checkHoleMatrix);

    // ==========================================================================
    // 4. AJAX FORMULAR-VERSAND AN DAS CRM BACKEND
    // ==========================================================================
    const vinylForm = document.getElementById("vinylContactForm");
    const vSubmitBtn = document.getElementById("vSubmitBtn");
    const vFileResetBtn = document.getElementById("vFileResetBtn");

    if (vinylForm) {
        vinylForm.addEventListener("submit", function (event) {
            
            const hatProdukt = produktCheckboxes.some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatRuecken = [
                "Ruecken_Ohne", "Ruecken_3mm", "Ruecken_6mm", "Ruecken_7mm", "Ruecken_10mm"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatKarton = [
                "Karton_Chromokarton", "Karton_Kraftkarton", "Karton_Graukarton", "Karton_Sulfatkarton"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatFarbigkeit = [
                "Farbe_4c", "Farbe_1c", "Farbe_Sonder"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatGrammatur = [
                "Gramm_180", "Gramm_GZ1_190", "Gramm_GC1_200", "Gramm_300", "Gramm_GC1_300",
                "Gramm_350", "Gramm_GC1_350", "Gramm_Andere"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            if (!hatProdukt || !hatRuecken || !hatKarton || !hatFarbigkeit || !hatGrammatur) {
                event.preventDefault();
                let fehler = "Bitte füllen Sie folgende Pflichtbereiche aus:\n";
                if (!hatProdukt) fehler += "• Mindestens einen Produkt-Typ auswählen\n";
                if (!hatRuecken) fehler += "• Mindestens eine Rückenbreite auswählen\n";
                if (!hatKarton) fehler += "• Mindestens eine Kartonsorte auswählen\n";
                if (!hatFarbigkeit) fehler += "• Mindestens eine Farbigkeit auswählen\n";
                if (!hatGrammatur) fehler += "• Mindestens eine Grammatur auswählen\n";
                alert(fehler);
                return;
            }

            event.preventDefault();

            if (vSubmitBtn) {
                vSubmitBtn.disabled = true;
                vSubmitBtn.textContent = "Wird gesendet...";
            }

            const formData = new FormData(this);
            const fileInput = document.getElementById("vFile");

            const rueckenbreiten = [];
            if (formData.get("Ruecken_Ohne")) rueckenbreiten.push("Ohne Rücken");
            if (formData.get("Ruecken_3mm")) rueckenbreiten.push("3 mm");
            if (formData.get("Ruecken_6mm")) rueckenbreiten.push("6 mm");
            if (formData.get("Ruecken_7mm")) rueckenbreiten.push("7 mm");
            if (formData.get("Ruecken_10mm")) rueckenbreiten.push("10 mm");

            const kartonsorten = [];
            if (formData.get("Karton_Chromokarton")) kartonsorten.push("Chromokarton (GC1)");
            if (formData.get("Karton_Kraftkarton")) kartonsorten.push("Kraftkarton");
            if (formData.get("Karton_Graukarton")) kartonsorten.push("Graukarton");
            if (formData.get("Karton_Sulfatkarton")) kartonsorten.push("Sulfatkarton (GZ1)");

            const farbAuswahl = [];
            if (formData.get("Farbe_4c")) farbAuswahl.push("4/4-farbig (CMYK)");
            if (formData.get("Farbe_1c")) farbAuswahl.push("1/1-farbig (Schwarz/Weiß)");
            if (formData.get("Farbe_Sonder")) farbAuswahl.push("Sonderfarbe");

            const grammAuswahl = [];
            if (formData.get("Gramm_180")) grammAuswahl.push("180 g/m²");
            if (formData.get("Gramm_GZ1_190")) grammAuswahl.push("190 g/m²");
            if (formData.get("Gramm_GC1_200")) grammAuswahl.push("200 g/m²");
            if (formData.get("Gramm_300")) grammAuswahl.push("300 g/m²");
            if (formData.get("Gramm_GC1_300")) grammAuswahl.push("300 g/m² (GC1)");
            if (formData.get("Gramm_350")) grammAuswahl.push("350 g/m²");
            if (formData.get("Gramm_GC1_350")) grammAuswahl.push("350 g/m² (GC1)");
            const freitextGrammatur = formData.get("grammaturDetails") || "";
            if (formData.get("Gramm_Andere")) {
                grammAuswahl.push(freitextGrammatur.trim() !== "" ? freitextGrammatur : "Andere Grammatur");
            }

            const veredelungen = [];
            if (formData.get("Veredelung_Heissfolie")) veredelungen.push("Heißfolienprägung");
            if (formData.get("Veredelung_Lack")) veredelungen.push("Partielle Lackierung");
            if (formData.get("Veredelung_Blindpraegung")) veredelungen.push("Blindprägung");
            if (formData.get("Veredelung_Stanzung")) veredelungen.push("Stanzung");

            const dispersionCello = [];
            if (formData.get("Disp_Glanz")) dispersionCello.push("Dispersionslack glanz");
            if (formData.get("Disp_Matt")) dispersionCello.push("Dispersionslack matt");
            if (formData.get("Cello_Glanz")) dispersionCello.push("Cellophanierung glanz");
            if (formData.get("Cello_Matt")) dispersionCello.push("Cellophanierung matt (kratzfest)");

            const extrasList = [];
            if (formData.get("Extra_Innendruck")) extrasList.push("Innendruck der Tasche");
            if (formData.get("Extra_Optimierte_Mittelloecher")) extrasList.push("Optimierte Mittellöcher");
            if (formData.get("Extra_Zentrierte_Mittelloecher")) extrasList.push("Zentrierte Mittellöcher");
            if (formData.get("Extra_Schallplatten_Labels")) extrasList.push("Labels");
            if (formData.get("Extra_Einleger_Booklets")) extrasList.push("Einleger & Booklets");

            const dataObject = {
                formType: "vinyl",
                firmaBand: formData.get("firmaBand") || "",
                projektname: formData.get("projektname") || "",
                name: formData.get("name") || "",
                email: formData.get("email") || "",
                phone: formData.get("phone") || "",
                
                Produkt_Kastentasche_12: formData.get("Produkt_Kastentasche_12") ? true : false,
                Produkt_Kastentasche_10: formData.get("Produkt_Kastentasche_10") ? true : false,
                Produkt_Kastentasche_7: formData.get("Produkt_Kastentasche_7") ? true : false,
                Produkt_Gatefold_12: formData.get("Produkt_Gatefold_12") ? true : false,
                Produkt_Innentasche_12: formData.get("Produkt_Innentasche_12") ? true : false,
                Produkt_Innentasche_10: formData.get("Produkt_Innentasche_10") ? true : false,
                Produkt_Innentasche_7: formData.get("Produkt_Innentasche_7") ? true : false,
                
                stueckzahl_Kastentasche_12: formData.get("stueckzahl_Kastentasche_12") || "",
                extras_Kastentasche_12: formData.get("extras_Kastentasche_12") || "",
                stueckzahl_Kastentasche_10: formData.get("stueckzahl_Kastentasche_10") || "",
                extras_Kastentasche_10: formData.get("extras_Kastentasche_10") || "",
                stueckzahl_Kastentasche_7: formData.get("stueckzahl_Kastentasche_7") || "",
                extras_Kastentasche_7: formData.get("extras_Kastentasche_7") || "",
                stueckzahl_Gatefold_12: formData.get("stueckzahl_Gatefold_12") || "",
                extras_Gatefold_12: formData.get("extras_Gatefold_12") || "",
                stueckzahl_Innentasche_12: formData.get("stueckzahl_Innentasche_12") || "",
                extras_Innentasche_12: formData.get("extras_Innentasche_12") || "",
                stueckzahl_Innentasche_10: formData.get("stueckzahl_Innentasche_10") || "",
                extras_Innentasche_10: formData.get("extras_Innentasche_10") || "",
                stueckzahl_Innentasche_7: formData.get("stueckzahl_Innentasche_7") || "",
                extras_Innentasche_7: formData.get("extras_Innentasche_7") || "",
                
                Gatefold_Kraftkarton: formData.get("Gatefold_Kraftkarton") ? true : false,
                Gatefold_Graukarton: formData.get("Gatefold_Graukarton") ? true : false,
                
                stueckzahl_Labels: formData.get("stueckzahl_Labels") || "",
                stueckzahl_Einleger: formData.get("stueckzahl_Einleger") || "",
                
                rueckenbreite: rueckenbreiten.join(", ") || "Keine Auswahl",
                veredelung: veredelungen.join(", ") || "Keine Auswahl",
                kartonsorte: kartonsorten.join(", ") || "Keine Auswahl",
                
                farbigkeit: farbAuswahl.join(", ") || "Keine Auswahl",
                sonderfarbeDetails: formData.get("sonderfarbeDetails") || "",
                grammatur: grammAuswahl.join(", ") || "Keine Auswahl",
                dispersionCello: dispersionCello.join(", ") || "Keine Auswahl",
                
                insideOut: formData.get("Verarbeitung_Inside_Out") ? true : false,
                extras: extrasList.join(", ") || "Keine Auswahl",
                
                stueckzahl: formData.get("stueckzahl") || "",
                datenlink: formData.get("datenlink") || "", 
                message: formData.get("message") || ""
            };

            function sendData(payload) {
                fetch(vinylForm.action, {
                    method: "POST",
                    redirect: "follow",
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erfolg === true) {
                        if (typeof bootstrap !== 'undefined') {
                            const thankYouModalEl = document.getElementById('thankYouModal');
                            const thankYouModal = new bootstrap.Modal(thankYouModalEl);
                            thankYouModal.show();
                        } else {
                            alert("Danke! Ihre Spezifikations-Anfrage wurde erfolgreich übermittelt.");
                        }
                        vinylForm.reset();
                        document.querySelectorAll(".product-detail-fields").forEach(d => d.classList.add("d-none"));
                        if (vFileResetBtn) vFileResetBtn.classList.add("d-none");
                        checkHoleMatrix();
                    } else {
                        alert("CRM-Fehler: " + data.meldung);
                    }
                })
                .catch(err => {
                    alert("Verbindungsfehler zum CRM. Anfrage konnte nicht übermittelt werden.");
                })
                .finally(() => {
                    if (vSubmitBtn) {
                        vSubmitBtn.disabled = false;
                        vSubmitBtn.textContent = "Spezifikations-Anfrage absenden";
                    }
                });
            }

            if (fileInput && fileInput.files.length > 0) {
                const selectedFile = fileInput.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = function () {
                    dataObject.fileData = reader.result;
                    dataObject.fileName = selectedFile.name;
                    sendData(dataObject);
                };
            } else {
                sendData(dataObject);
            }
        });
    }

        
        // ==========================================================================
// VINYL-KONFIGURATOR: REAKTIVE GRAMMATUR-AUSWAHLMATRIX
// ==========================================================================
function updateGrammaturOptions() {
    const pType = document.getElementById("configProductType").value;
    const karton = document.getElementById("configKarton").value;
    const grammSelect = document.getElementById("configGrammatur");
    
    if (!grammSelect) return;
    grammSelect.innerHTML = "";
    
    let optionen = [];
    
    // Logik-Matrix für Gatefold vs. Standard-Produkte
    if (pType === "12\" Gatefold") {
        if (karton === "Chromokarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Kraftkarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Graukarton") {
            optionen = ["350 g/m²"];
        }
    } else {
        // Standard-Produkte (Kastentaschen, Innentaschen etc.)
        if (karton === "Chromokarton") {
            optionen = ["200 g/m²", "300 g/m²", "350 g/m²"];
        } else if (karton === "Kraftkarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Graukarton") {
            optionen = ["350 g/m²"];
        } else if (karton === "Sulfatkarton") {
            optionen = ["190 g/m²"];
        }
    }
    
    if (optionen.length === 0) {
        optionen = ["Keine Auswahl verfügbar"];
    }
    
    optionen.forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        grammSelect.appendChild(opt);
    });
}

// Event-Kopplung für reaktive UI-Wechsel (im bereits laufenden DOMContentLoaded-Handler)
const pTypeSelect = document.getElementById("configProductType");
const kartonSelect = document.getElementById("configKarton");

if (pTypeSelect) pTypeSelect.addEventListener("change", updateGrammaturOptions);
if (kartonSelect) kartonSelect.addEventListener("change", updateGrammaturOptions);

// Initialer Trigger zur ersten Befüllung des Dropdowns
updateGrammaturOptions();

});         