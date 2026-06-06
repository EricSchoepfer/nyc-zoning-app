const sandboxRegistry = {
    "4013230044": { address: "54-11 QUEENS BOULEVARD", zoning: "R7X", overlay: "C2-3", special: "None", lotArea: 10180 },
    "54-11 QUEENS BOULEVARD": { address: "54-11 QUEENS BOULEVARD", bbl: "4013230044", zoning: "R7X", overlay: "C2-3", special: "None", lotArea: 10180 },
    
    "1000290001": { address: "26 BROADWAY", zoning: "C4-6", overlay: "None", special: "Special Midtown District (MiD)", lotArea: 77329 },
    "26 BROADWAY": { address: "26 BROADWAY", bbl: "1000290001", zoning: "C4-6", overlay: "None", special: "Special Midtown District (MiD)", lotArea: 77329 },
    
    "3019640001": { address: "124 GRAND AVENUE", zoning: "R7-1", overlay: "C2-4", special: "None", lotArea: 12500 },
    "124 GRAND AVENUE": { address: "124 GRAND AVENUE", bbl: "3019640001", zoning: "R7-1", overlay: "C2-4", special: "None", lotArea: 12500 },

    "3019640025": { address: "210 PARK PLACE", zoning: "R6B", overlay: "None", special: "None", lotArea: 2000 },
    "210 PARK PLACE": { address: "210 PARK PLACE", bbl: "3019640025", zoning: "R6B", overlay: "None", special: "None", lotArea: 2000 }
};

const zoningDictionary = {
    "R1": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood community facilities, houses of worship." },
    "R2": { stdFar: 0.50, uapFar: 0.50, cfFar: 1.00, resUses: "Single-Family Detached Residences.", cfUses: "Basic neighborhood community facilities, houses of worship." },
    "R3": { stdFar: 0.50, uapFar: 0.60, cfFar: 1.00, resUses: "Low-Rise Contextual Multi-Family Profiles.", cfUses: "Houses of worship, medical clinics, schools, clubs." },
    "R4": { stdFar: 0.75, uapFar: 0.90, cfFar: 2.00, resUses: "Rowhouses and small multi-family garden apartments.", cfUses: "Local schools, houses of worship, medical clinics." },
    "R5": { stdFar: 1.25, uapFar: 1.65, cfFar: 2.00, resUses: "Single/Two-Family Rowhouses and small apartments.", cfUses: "Houses of worship, medical offices, schools." },
    "R6": { stdFar: 2.20, uapFar: 3.60, cfFar: 4.80, resUses: "Medium-Density Apartment complexes, Traditional Height Factor.", cfUses: "Schools, medical centers, libraries, community centers." },
    "R6B": { stdFar: 2.00, uapFar: 2.20, cfFar: 2.00, resUses: "Traditional Contextual Low-Rise Rowhouses.", cfUses: "Neighborhood community assets, houses of worship." },
    "R7": { stdFar: 3.44, uapFar: 4.60, cfFar: 4.80, resUses: "Medium-High Density Apartments, Quality Housing Framework.", cfUses: "Ambulatory healthcare services, full educational facilities." },
    "R7-1": { stdFar: 3.44, uapFar: 4.60, cfFar: 4.80, resUses: "Medium-High Density Height Factor / Quality Housing Profile.", cfUses: "Ambulatory medical, educational facilities." },
    "R7A": { stdFar: 4.00, uapFar: 4.60, cfFar: 4.00, resUses: "High-Density Quality Housing Contextual Profiles.", cfUses: "Ambulatory care assets, schools, libraries." },
    "R7X": { stdFar: 5.00, uapFar: 6.00, cfFar: 5.00, resUses: "Contextual Multi-Family Envelopes. Strict front walls.", cfUses: "Medical facilities, schools, libraries, non-profit institutions." },
    "R8": { stdFar: 6.02, uapFar: 7.20, cfFar: 6.50, resUses: "High-Density Urban Apartments, tower or high-bulk layouts.", cfUses: "Hospitals, full non-profit complexes, universities." },
    "R10": { stdFar: 10.00, uapFar: 12.00, cfFar: 10.00, resUses: "Maximum Density Urban Residential Towers.", cfUses: "Full hospitals, research libraries, community headquarters." },
    "C4": { stdFar: 3.40, uapFar: 4.00, cfFar: 4.80, resUses: "Mixed-use commercial-residential variants inside clusters.", cfUses: "Ambulatory care assets, local training spaces." },
    "C4-6": { stdFar: 10.00, uapFar: 12.00, cfFar: 10.00, resUses: "High-Bulk Commercial Skyscraper Core.", cfUses: "Institutional assets, medical research towers." },
    "M1": { stdFar: 1.00, uapFar: 1.00, cfFar: 2.40, resUses: "🚫 Standalone Residential Use prohibited.", cfUses: "Performance standard community facilities and custom public uses." }
};

document.getElementById("addressBtn").onclick = function() {
    hideLiveLog();
    var addressText = document.getElementById("addressInput").value;
    if (!addressText || addressText.trim() === "") { alert("Please enter an address."); return; }
    
    var key = addressText.trim().toUpperCase();
    var record = sandboxRegistry[key];
    
    if (record) {
        processMetricsAndLayout(record.bbl, record.zoning, record.overlay, record.special, record.lotArea, record.address);
    } else {
        showLiveLog("Address not loaded in sandbox data table registry block.");
    }
};

document.getElementById("bblBtn").onclick = function() {
    hideLiveLog();
    var boro = document.getElementById("boroughInput").value;
    var blockRaw = document.getElementById("blockInput").value;
    var lotRaw = document.getElementById("lotInput").value;
    if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") { alert("Fill out BBL fields."); return; }
    
    var block = String(blockRaw.trim()).padStart(5, '0');
    var lot = String(lotRaw.trim()).padStart(4, '0');
    var computedBbl = boro + block + lot;
    
    var record = sandboxRegistry[computedBbl];
    
    if (record) {
        processMetricsAndLayout(computedBbl, record.zoning, record.overlay, record.special, record.lotArea, record.address);
    } else {
        showLiveLog("BBL number identifier sequence not loaded in sandbox data table registry block.");
    }
};

function showLiveLog(msg) {
    var logger = document.getElementById("liveLog");
    logger.innerText = "System Notice: " + msg;
    logger.style.display = "block";
}

function hideLiveLog() { document.getElementById("liveLog").style.display = "none"; }

function processMetricsAndLayout(bbl, zoning, overlay, special, lotArea, address) {
    document.getElementById("infoAddress").innerText = address;
    document.getElementById("infoBbl").innerText = bbl;
    document.getElementById("infoZoning").innerText = zoning;
    document.getElementById("infoOverlay").innerText = overlay;
    document.getElementById("infoSpecial").innerText = special;
    document.getElementById("infoLotArea").innerText = lotArea.toLocaleString() + " SF";

    var lookup = zoningDictionary[zoning] || { stdFar: 2.00, uapFar: 2.40, cfFar: 2.00, resUses: "Housing allowed.", cfUses: "Facility allowed." };
    
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

    var firstLetter = zoning.charAt(0);
    if (overlay !== "None" && overlay !== "") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted via Overlay (" + overlay + "):</b><br>Allows ground floor local retail stores (<b>Use Group VI</b>).";
    } else if (firstLetter === "C") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Commercial Zone):</b><br>Broad commercial retail operations allowed across all floorplates.";
    } else if (firstLetter === "M") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows automotive repair workshops, freight hubs, and warehouses.";
    } else { 
        document.getElementById("commUseText").innerHTML = "<b>🚫 Commercial Restricted:</b><br>No commercial overlay options exist. Retail is disallowed."; 
    }

    var specialNotice = "Standard underlying city-wide framework text rules apply.";
    if (special !== "None" && special !== "") {
        specialNotice = "<b style='color:#ef4444'>⚠️ Special District Active (" + special + "):</b> Custom setbacks take priority.";
    }

    // TAILORED DYNAMIC COMPILER: Injects status tags, floor plate limits, and required calculations cleanly
    document.getElementById("tableBody").innerHTML = 
        "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right</td><td>Residential and Community Facility footprints can expand across full floorplates up to maximum zoning envelope limits.</td><td>Commercial retail uses are restricted to the ground level or first floor via active overlays.</td><td><span style='color:#0d9488; font-weight:bold;'>✔️ MANDATORY</span></td></tr>" +
        "<tr><td><b>ZR 23-12</b></td><td>Lot Area & Width Rules</td><td>Requires specific lot sizes for individual building types to proceed with parcel subdivisions.</td><td>Protects historic narrower rowhouses from redevelopment penalties.</td><td><span style='color:#0d9488; font-weight:bold;'>✔️ MANDATORY</span></td></tr>" +
        "<tr><td><b>ZR 23-22 / 34-111</b></td><td>Residential Baseline Max</td><td>Caps standard residential space at <b>" + lookup.stdFar.toFixed(2) + " FAR</b> (" + stdMaxZfa.toLocaleString() + " SF). Restricts building to standard floor area tracks.</td><td>Expanded tracks do not apply under standard baseline parameters.</td><td><span style='color:#4b5563; font-weight:bold;'>⚙️ OPTIONAL</span></td></tr>" +
