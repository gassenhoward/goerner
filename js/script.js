document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. INTRO ANIMATION TRIGGERS (Fehlersicher gekapselt)
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
    }, 300);

    // ==========================================================================
    // 2. VISUELLE KACHELN: INTERAKTIVES EINBLENDEN DER MENGEN UND EXTRAS
    // ==========================================================================
    // ==========================================================================
    // 13. AJAX FORMULAR-VERSAND AN DAS CRM BACKEND (Originalgetreu & Repariert)
    // ==========================================================================
    const vinylForm = document.getElementById("vinylContactForm");
    const vSubmitBtn = document.getElementById("vSubmitBtn");

    if (vinylForm) {
        vinylForm.addEventListener("submit", function (event) {
            
            // Validierung der originalen Pflichtbereiche
            const hatProdukt = [
                "Produkt_Kastentasche_12", "Produkt_Kastentasche_10", "Produkt_Kastentasche_7",
                "Produkt_Gatefold_12", "Produkt_Innentasche_12", "Produkt_Innentasche_10", "Produkt_Innentasche_7"
            ].some(name => {
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

            // 1. Rückenbreiten
            const rueckenbreiten = [];
            if (formData.get("Ruecken_Ohne")) rueckenbreiten.push("Ohne Rücken");
            if (formData.get("Ruecken_3mm")) rueckenbreiten.push("3 mm");
            if (formData.get("Ruecken_6mm")) rueckenbreiten.push("6 mm");
            if (formData.get("Ruecken_7mm")) rueckenbreiten.push("7 mm");
            if (formData.get("Ruecken_10mm")) rueckenbreiten.push("10 mm");

            // 2. Kartonsorten
            const kartonsorten = [];
            if (formData.get("Karton_Chromokarton")) kartonsorten.push("Chromokarton (GC1)");
            if (formData.get("Karton_Kraftkarton")) kartonsorten.push("Kraftkarton");
            if (formData.get("Karton_Graukarton")) kartonsorten.push("Graukarton");
            if (formData.get("Karton_Sulfatkarton")) kartonsorten.push("Sulfatkarton (GZ1)");

            // 3. Farbigkeit
            const farbAuswahl = [];
            if (formData.get("Farbe_4c")) farbAuswahl.push("4/4-farbig (CMYK)");
            if (formData.get("Farbe_1c")) farbAuswahl.push("1/1-farbig (Schwarz/Weiß)");
            if (formData.get("Farbe_Sonder")) farbAuswahl.push("Sonderfarbe");

            // 4. Grammatur (Zuvor fehlende Definition repariert!)
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

            // 5. Veredelungen
            const veredelungen = [];
            if (formData.get("Veredelung_Heissfolie")) veredelungen.push("Heißfolienprägung");
            if (formData.get("Veredelung_Lack")) veredelungen.push("Partielle Lackierung");
            if (formData.get("Veredelung_Blindpraegung")) veredelungen.push("Blindprägung");
            if (formData.get("Veredelung_Stanzung")) veredelungen.push("Stanzung");

            // 6. Dispersion & Cellophanierung (Zuvor fehlende Definition repariert!)
            const dispersionCello = [];
            if (formData.get("Disp_Glanz")) dispersionCello.push("Dispersionslack glanz");
            if (formData.get("Disp_Matt")) dispersionCello.push("Dispersionslack matt");
            if (formData.get("Cello_Glanz")) dispersionCello.push("Cellophanierung glanz");
            if (formData.get("Cello_Matt")) dispersionCello.push("Cellophanierung matt (kratzfest)");

            // 7. Extras
            const extrasList = [];
            if (formData.get("Extra_Innendruck")) extrasList.push("Innendruck der Tasche");
            if (formData.get("Extra_Optimierte_Mittelloecher")) extrasList.push("Optimierte Mittellöcher");
            if (formData.get("Extra_Zentrierte_Mittelloecher")) extrasList.push("Zentrierte Mittellöcher");
            if (formData.get("Extra_Schallplatten_Labels")) extrasList.push("Labels");
            if (formData.get("Extra_Einleger_Booklets")) extrasList.push("Einleger & Booklets");

            // 8. Payload-Datenpaket für api.js
            const dataObject = {
                formType: "vinyl",
                firmaBand: formData.get("firmaBand") || "",
                projektname: formData.get("projektname") || "",
                name: formData.get("name") || "",
                email: formData.get("email") || "",
                phone: formData.get("phone") || "",
                
                // Produkte
                Produkt_Kastentasche_12: formData.get("Produkt_Kastentasche_12") ? true : false,
                Produkt_Kastentasche_10: formData.get("Produkt_Kastentasche_10") ? true : false,
                Produkt_Kastentasche_7: formData.get("Produkt_Kastentasche_7") ? true : false,
                Produkt_Gatefold_12: formData.get("Produkt_Gatefold_12") ? true : false,
                Produkt_Innentasche_12: formData.get("Produkt_Innentasche_12") ? true : false,
                Produkt_Innentasche_10: formData.get("Produkt_Innentasche_10") ? true : false,
                Produkt_Innentasche_7: formData.get("Produkt_Innentasche_7") ? true : false,
                
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

            // Dateiupload via FileReader
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
    if (optLochZentr) optLochZentr.addEventListener("change", checkHoleMatrix);
    if (optLochOpt) optLochOpt.addEventListener("change", checkHoleMatrix);
});