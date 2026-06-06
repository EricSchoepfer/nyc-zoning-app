```javascript
const zoningDictionary = {
    "R1": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood facilities, houses of worship." },
    "R2": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood community facilities, houses of worship." },
    "R3": { stdFar: 0.50, uapFar: 0.60, cfFar: 1.00, resUses: "Low-Rise Contextual Multi-Family Profiles.", cfUses: "Houses of worship, medical clinics, schools, clubs." },
    "R4": { stdFar: 0.75, uapFar: 0.90, cfFar: 2.00, resUses: "Rowhouses and small multi-family garden apartments.", cfUses: "Local schools, houses of worship, medical clinics." },
    "R5": { stdFar: 1.25, uapFar: 1.65, cfFar: 2.00, resUses: "Single/Two-Family Rowhouses and small apartments.", cfUses: "Houses of worship, medical offices, schools." },
    "R6": { stdFar: 2.20, uapFar: 3.60, cfFar: 4.80, resUses: "Medium-Density Apartment complexes, Traditional Height Factor.", cfUses: "Schools, medical centers, libraries, community centers." },
    "R6B": { stdFar: 2.00, uapFar: 2.20, cfFar: 2.00, resUses: "Traditional Contextual Low-Rise Rowhouses.", cfUses: "Neighborhood community assets, houses of worship." },
    "R7": { stdFar: 3.44, uapFar: 4.60, cfFar: 4.80, resUses: "Medium-High Density Apartments, Quality Housing Framework.", cfUses: "Ambulatory healthcare services, full educational facilities." },
    "R7A": { stdFar: 4.00, uapFar: 4.60, cfFar: 4.00, resUses: "High-Density Quality Housing Contextual Profiles.", cfUses: "Ambulatory care assets, schools, libraries." },
    "R7X": { stdFar: 5.00, uapFar: 6.00, cfFar: 5.00, resUses: "Contextual Multi-Family Envelopes. Strict front walls.", cfUses: "Medical facilities, schools, libraries, non-profit institutions." },
    "R8": { stdFar: 6.02, uapFar: 7.20, cfFar: 6.50, resUses: "High-Density Urban Apartments, tower or high-bulk layouts.", cfUses: "Hospitals, full non-profit complexes, universities." },
    "R10": { stdFar: 10.00, uapFar: 12.00, cfFar: 10.00, resUses: "Maximum Density Urban Residential Residential Towers.", cfUses: "Full hospitals, research libraries, community headquarters." },
    "C4": { stdFar: 3.40, uapFar: 4.00, cfFar: 4.80, resUses: "Mixed-use commercial-residential variants inside clusters.", cfUses: "Ambulatory care assets, local training spaces." },
    "C4-6": { stdFar: 10.00, uapFar: 12.00, cfFar: 10.00, resUses: "High-Bulk Commercial Skyscraper Core.", cfUses: "Institutional assets, medical research towers." },
    "M1": { stdFar: 1.00, uapFar: 1.00, cfFar: 2.40, resUses: "🚫 Standalone Residential Use prohibited.", cfUses: "Performance standard community facilities and custom public uses." }
};

// TRACK 1: Address Input Button Handler
document.getElementById("addressBtn").onclick = async function() {
    hideLiveLog();
    var addressText = document.getElementById("addressInput").value;
    if (!addressText || addressText.trim() === "") { alert("Please enter an address."); return; }
    
    document.getElementById("addressBtn").innerText = "Querying Live ZoLa...";
    var upperAddress = addressText.trim().toUpperCase();
    
    // OFFICIAL DCP ZOLA REPOSITORY GATEWAY: Secure open endpoint strips browser restrictions natively
    var url = "https://carto.com" + encodeURIComponent("SELECT address, bbl, zonedist1, overlay1, spdist1, lotarea FROM mappluto WHERE address LIKE '%" + upperAddress + "%' LIMIT 1");
    await executeLiveZoLaPipeline(url, addressText, "addressBtn", "Search Address Profile");
};

// TRACK 2: Borough/Block/Lot Button Handler
document.getElementById("bblBtn").onclick = async function() {
    hideLiveLog();
    var boro = document.getElementById("boroughInput").value;
    var blockRaw = document.getElementById("blockInput").value;
    var lotRaw = document.getElementById("lotInput").value;
    if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") { alert("Fill out BBL fields."); return; }
    
    document.getElementById("bblBtn").innerText = "Querying Live ZoLa Map...";
    var block = String(blockRaw.trim()).padStart(5, '0');
    var lot = String(lotRaw.trim()).padStart(4, '0');
    var computedBbl = boro + block + lot;
    
    var url = "https://carto.com" + encodeURIComponent("SELECT address, bbl, zonedist1, overlay1, spdist1, lotarea FROM mappluto WHERE bbl = " + computedBbl + " LIMIT 1");
    await executeLiveZoLaPipeline(url, "BBL Lookup Match", "bblBtn", "Search BBL Profile");
};

function showLiveLog(msg) {
    var logger = document.getElementById("liveLog");
    logger.innerText = "System Notice: " + msg;
    logger.style.display = "block";
}

function hideLiveLog() { document.getElementById("liveLog").style.display = "none"; }

// LIVE COGNITIVE ENVELOPE PIPELINE COMPILER
async function executeLiveZoLaPipeline(queryUrl, fallbackLabel, buttonId, originalButtonText) {
    var finalAddress = fallbackLabel, finalBbl = "N/A", finalZoning = "R6", finalOverlay = "None", finalSpecial = "None", finalLotArea = 4000;
    try {
        var res = await fetch(queryUrl);
        var data = await res.json();
        
        // ZOLA LAYER EXTRACTOR: Maps rows structure smoothly according to DCP standards [INDEX]
        if (data && data.rows && data.rows.length > 0) {
            var record = data.rows[0]; 
            finalAddress = record.address || fallbackLabel;
            finalBbl = record.bbl || "N/A";
            finalZoning = record.zonedist1 || "R6";
            finalOverlay = record.overlay1 || "None";
            finalSpecial = record.spdist1 || "None";
            // FIXED CASING MULTIPLIER: Safely reads the true lower-case variable name [INDEX]
            finalLotArea = parseFloat(record.lotarea) || finalLotArea;
        } else {
            showLiveLog("Location parameters not found inside active PLUTO books. Check street endings.");
            document.getElementById(buttonId).innerText = originalButtonText;
            return;
        }
    } catch (err) { 
        showLiveLog("Live data pipeline connection exception."); 
    }

    document.getElementById("infoAddress").innerText = finalAddress;
    document.getElementById("infoBbl").innerText = finalBbl;
    document.getElementById("infoZoning").innerText = finalZoning;
    document.getElementById("infoOverlay").innerText = finalOverlay;
    document.getElementById("infoSpecial").innerText = finalSpecial;
    document.getElementById("infoLotArea").innerText = finalLotArea.toLocaleString() + " SF";

    // Strip dash variations seamlessly (e.g. turning "R7-1" into "R7" dynamically)
    var cleanKey = finalZoning.toUpperCase().replace(/[^A-Z0-9]/g, "");
    var zoneMatch = cleanKey.match(/^([A-Z]+[0-9]+)/);
    if (zoneMatch && zoneMatch) {
        cleanKey = zoneMatch[0];
    } else {
        cleanKey = cleanKey.substring(0, 2);
    }

    var lookup = zoningDictionary[cleanKey] || zoningDictionary[cleanKey.substring(0, 2)] || { stdFar: 2.00, uapFar: 2.40, cfFar: 2.00, resUses: "Allowed.", cfUses: "Allowed." };
    
    var stdMaxZfa = Math.round(finalLotArea * lookup.stdFar);
    var uapMaxZfa = Math.round(finalLotArea * lookup.uapFar);
    var cfMaxZfa = Math.round(finalLotArea * lookup.cfFar);

    document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
    document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";
    
    document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
    document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("lblCfFar").innerText = lookup.cfFar.toFixed(2) + " FAR";
    document.getElementById("lblCfMaxSf").innerText = "Max Capacity: " + cfMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("resUseText").innerHTML = "<b>Permitted (Residences):</b><br>" + lookup.resUses;
    document.getElementById("cfUseText").innerHTML = "<b>Permitted (Community Facilities):</b><br>" + lookup.cfUses;

    var firstLetter = cleanKey.charAt(0);
    if (finalOverlay !== "None" && finalOverlay !== "" && finalOverlay !== null) {
        document.getElementById("commUseText").innerHTML = "<b>Permitted via Overlay (" + finalOverlay + "):</b><br>Allows ground floor local retail stores (<b>Use Group VI</b>).";
    } else if (firstLetter === "C") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Commercial Zone):</b><br>Broad commercial retail operations allowed across all floorplates.";
    } else if (firstLetter === "M") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows automotive repair workshops, freight hubs, and warehouses.";
    } else { document.getElementById("commUseText").innerHTML = "<b>🚫 Commercial Restricted:</b><br>No commercial overlay options exist. Retail is disallowed."; }

    var specialNotice = "Standard underlying city-wide framework text rules apply.";
    if (finalSpecial !== "None" && finalSpecial !== "" && finalSpecial !== null) {
        specialNotice = "<b style='color:#ef4444'>⚠️ Special District Active (" + finalSpecial + "):</b> Custom setbacks take priority.";
    }

    document.getElementById("tableBody").innerHTML = 
        "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right <br><span style='color:#0d9488; font-weight:bold;'>[✔️ MANDATORY]</span></td><td>Standalone residential and community facility options govern footprints.</td><td>Zero-lot-line footprints shift parameters entirely.</td></tr>" +
