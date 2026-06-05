```javascript
const zoningDictionary = {
    "R1": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood facilities, houses of worship." },
    "R2": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood facilities, houses of worship." },
    "R3": { stdFar: 0.50, uapFar: 0.60, cfFar: 1.00, resUses: "Low-Rise Contextual Multi-Family Profiles.", cfUses: "Houses of worship, medical clinics, schools, clubs." },
    "R4": { stdFar: 0.75, uapFar: 0.90, cfFar: 2.00, resUses: "Rowhouses and small multi-family garden apartments.", cfUses: "Local schools, houses of worship, medical clinics." },
    "R5": { stdFar: 1.25, uapFar: 1.65, cfFar: 2.00, resUses: "Single/Two-Family Rowhouses and small apartments.", cfUses: "Houses of worship, medical offices, schools." },
    "R6": { stdFar: 2.20, uapFar: 3.60, cfFar: 4.80, resUses: "Medium-Density Apartment complexes, Traditional Height Factor.", cfUses: "Schools, medical centers, libraries, community centers." },
    "R6B": { stdFar: 2.00, uapFar: 2.20, cfFar: 2.00, resUses: "Traditional Contextual Low-Rise Rowhouses.", cfUses: "Neighborhood community assets, houses of worship." },
    "R7": { stdFar: 3.44, uapFar: 4.60, cfFar: 4.80, resUses: "Medium-High Density Apartments, Quality Housing Framework.", cfUses: "Ambulatory healthcare services, full educational facilities." },
    "R7A": { stdFar: 4.00, uapFar: 4.60, cfFar: 4.00, resUses: "High-Density Quality Housing Contextual Profiles.", cfUses: "Ambulatory care assets, schools, libraries." },
    "R7X": { stdFar: 5.00, uapFar: 6.00, cfFar: 5.00, resUses: "Contextual Multi-Family Envelopes. Strict front walls.", cfUses: "Medical facilities, schools, libraries, non-profit institutions." },
    "R8": { stdFar: 6.02, uapFar: 7.20, cfFar: 6.50, resUses: "High-Density Urban Apartments, tower or high-bulk layouts.", cfUses: "Hospitals, full non-profit complexes, universities." },
    "R10": { stdFar: 10.00, uapFar: 12.00, cfFar: 10.00, resUses: "Maximum Density Urban Residential Towers.", cfUses: "Full hospitals, research libraries, community headquarters." },
    "C4": { stdFar: 3.40, uapFar: 4.00, cfFar: 4.80, resUses: "Mixed-use commercial-residential variants inside clusters.", cfUses: "Ambulatory care assets, local training spaces." },
    "M1": { stdFar: 1.00, uapFar: 1.00, cfFar: 2.40, resUses: "🚫 Standalone Residential Use prohibited.", cfUses: "Performance standard community facilities and custom public uses." }
};

document.addEventListener("DOMContentLoaded", function() {
    var initialInput = prompt("Please enter any real NYC Street Address or 10-Digit BBL to compute metrics instantly:", "54-11 Queens Boulevard");
    
    if (initialInput && initialInput.trim() !== "") {
        var cleanInput = initialInput.trim().toUpperCase();
        document.getElementById("addressInput").value = initialInput;
        
        var queryStr = "SELECT address, bbl, zonedist1, overlay1, spdist1, lotarea FROM mappluto WHERE address LIKE '%" + cleanInput + "%' OR bbl = '" + cleanInput + "' LIMIT 1";
        executeJsonpQuery(queryStr, initialInput, "addressBtn", "Search Address Profile");
    }
});

document.getElementById("addressBtn").onclick = function() {
    hideLiveLog();
    var textStr = document.getElementById("addressInput").value;
    if (!textStr || textStr.trim() === "") { alert("Please enter an address."); return; }
    
    document.getElementById("addressBtn").innerText = "Connecting Live Cloud...";
    var clean = textStr.trim().toUpperCase();
    
    var queryStr = "SELECT address, bbl, zonedist1, overlay1, spdist1, lotarea FROM mappluto WHERE address LIKE '%" + clean + "%' LIMIT 1";
    executeJsonpQuery(queryStr, textStr, "addressBtn", "Search Address Profile");
};

document.getElementById("bblBtn").onclick = function() {
    hideLiveLog();
    var boro = document.getElementById("boroughInput").value;
    var blockRaw = document.getElementById("blockInput").value;
    var lotRaw = document.getElementById("lotInput").value;
    if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") { alert("Fill out full BBL fields."); return; }
    
    document.getElementById("bblBtn").innerText = "Querying Tax Map...";
    var block = String(blockRaw.trim()).padStart(5, '0');
    var lot = String(lotRaw.trim()).padStart(4, '0');
    var computedBbl = boro + block + lot;
    
    var queryStr = "SELECT address, bbl, zonedist1, overlay1, spdist1, lotarea FROM mappluto WHERE bbl = " + computedBbl + " LIMIT 1";
    executeJsonpQuery(queryStr, "BBL Lookup Match", "bblBtn", "Search BBL Profile");
};

function showLiveLog(msg) {
    var logger = document.getElementById("liveLog");
    logger.innerText = "System Notice: " + msg;
    logger.style.display = "block";
}

function hideLiveLog() { document.getElementById("liveLog").style.display = "none"; }

function executeJsonpQuery(sql, fallbackLabel, buttonId, originalButtonText) {
    $.ajax({
        url: "https://carto.com",
        dataType: "jsonp",
        data: { q: sql },
        success: function(data) {
            if (data && data.rows && data.rows.length > 0) {
                var record = data.rows[0]; 
                
                var finalAddress = record.address || fallbackLabel;
                var finalBbl = record.bbl || "N/A";
                var finalZoning = record.zonedist1 || "R6";
                var finalOverlay = record.overlay1 || "None";
                var finalSpecial = record.spdist1 || "None";
                var finalLotArea = parseFloat(record.lotarea) || 4000;
                
                renderZoningDataSheets(finalBbl, finalZoning, finalOverlay, finalSpecial, finalLotArea, finalAddress);
            } else {
                showLiveLog("Location parameters not found inside live PLUTO records. Check your spelling formatting.");
            }
            document.getElementById(buttonId).innerText = originalButtonText;
        },
        error: function() {
            showLiveLog("Live city network bottleneck encountered.");
            document.getElementById(buttonId).innerText = originalButtonText;
        }
    });
}

function renderZoningDataSheets(bbl, zoning, overlay, special, lotArea, address) {
    document.getElementById("infoAddress").innerText = address;
    document.getElementById("infoBbl").innerText = bbl;
    document.getElementById("infoZoning").innerText = zoning;
    document.getElementById("infoOverlay").innerText = overlay;
    document.getElementById("infoSpecial").innerText = special;
    document.getElementById("infoLotArea").innerText = lotArea.toLocaleString() + " SF";

    var cleanKey = zoning.toUpperCase().replace(/[^A-Z0-9]/g, "");
    var zoneMatch = cleanKey.match(/^([A-Z]+[0-9]+)/);
    if (zoneMatch && zoneMatch[0]) {
        cleanKey = zoneMatch[0];
    } else {
        cleanKey = cleanKey.substring(0, 2);
    }

    var lookup = zoningDictionary[cleanKey] || zoningDictionary[cleanKey.substring(0, 2)] || { stdFar: 2.00, uapFar: 2.40, cfFar: 2.00, resUses: "Allowed.", cfUses: "Allowed." };
    
    var stdMaxZfa = Math.round(lotArea * lookup.stdFar);
    var uapMaxZfa = Math.round(lotArea * lookup.uapFar);
    var cfMaxZfa = Math.round(lotArea * lookup.cfFar);

    document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
    document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
    document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("lblCfFar").innerText = lookup.cfFar.toFixed(2) + " FAR";
    document.getElementById("lblCfMaxSf").innerText = "Max Capacity: " + cfMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("resUseText").innerHTML = "<b>Permitted (Residences):</b><br>" + lookup.resUses;
    document.getElementById("cfUseText").innerHTML = "<b>Permitted (Community Facilities):</b><br>" + lookup.cfUses;

    var firstLetter = cleanKey.charAt(0);
    if (overlay !== "None" && overlay !== "" && overlay !== null) {
        document.getElementById("commUseText").innerHTML = "<b>Permitted via Overlay (" + overlay + "):</b><br>Allows ground floor local retail stores (<b>Use Group VI</b>).";
    } else if (firstLetter === "C") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Commercial Zone):</b><br>Broad commercial retail operations allowed across all floorplates.";
    } else if (firstLetter === "M") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows automotive repair workshops, freight hubs, and warehouses.";
    } else { document.getElementById("commUseText").innerHTML = "<b>🚫 Commercial Restricted:</b><br>No commercial overlay options exist. Retail is disallowed."; }

    var specialNotice = "Standard underlying city-wide framework text rules apply.";
    if (special !== "None" && special !== "" && special !== null) {
        specialNotice = "<b style='color:#ef4444'>⚠️ Special District Active (" + special + "):</b> Custom setbacks take absolute priority.";
    }

    document.getElementById("tableBody").innerHTML = 
        "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right</td><td>Standalone residential and community facility options govern footprints.</td><td>" + specialNotice + "</td></tr>" +
        "<tr><td><b>ZR 23-12</b></td><td>Lot Area & Width Rules</td><td>Minimum lot size criteria determine subdivide allowances.</td><td>Contextual profiles protect pre-existing historic lines.</td></tr>" +
