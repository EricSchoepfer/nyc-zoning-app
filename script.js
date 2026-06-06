const sandboxRegistry = {
    "4013230044": { address: "54-11 QUEENS BOULEVARD", zoning: "R7X", overlay: "C2-3", special: "None", lotArea: 10180 },
    "54-11 QUEENS BOULEVARD": { address: "54-11 QUEENS BOULEVARD", bbl: "4013230044", zoning: "R7X", overlay: "C2-3", special: "None", lotArea: 10180 },
    
    "1000290001": { address: "26 BROADWAY", zoning: "C4-6", overlay: "None", special: "Special Midtown District (MiD)", lotArea: 77329 },
    "26 BROADWAY": { address: "26 BROADWAY", bbl: "1000290001", zoning: "C4-6", overlay: "None", special: "Special Midtown District (MiD)", lotArea: 77329 },
    
    "3019640001": { address: "124 GRAND AVENUE", zoning: "R7X", overlay: "C2-4", special: "None", lotArea: 12500 },
    "124 GRAND AVENUE": { address: "124 GRAND AVENUE", bbl: "3019640001", zoning: "R7X", overlay: "C2-4", special: "None", lotArea: 12500 },

    "3019640025": { address: "210 PARK PLACE", zoning: "R6B", overlay: "None", special: "None", lotArea: 2000 },
    "210 PARK PLACE": { address: "210 PARK PLACE", bbl: "3019640025", zoning: "R6B", overlay: "None", special: "None", lotArea: 2000 }
};

const zoningDictionary = {
    "R1": { stdFar: 0.50, uapFar: 0.50, resUses: "Single-Family Detached Residences.", cfUses: "Basic community facilities." },
    "R2": { stdFar: 0.50, uapFar: 0.50, resUses: "Single-Family Detached Residences.", cfUses: "Basic community facilities." },
    "R3": { stdFar: 0.50, uapFar: 0.60, resUses: "Low-Rise Multi-Family Contextual.", cfUses: "Houses of worship, clinics, schools." },
    "R4": { stdFar: 0.75, uapFar: 0.90, resUses: "Detached/Semi-Detached rowhouses.", cfUses: "Local schools, houses of worship." },
    "R5": { stdFar: 1.25, uapFar: 1.65, resUses: "Single/Two-Family Rowhouses.", cfUses: "Houses of worship, medical offices." },
    "R6": { stdFar: 2.20, uapFar: 3.60, resUses: "Medium-Density Apartment complexes.", cfUses: "Schools, medical centers, libraries." },
    "R6B": { stdFar: 2.00, uapFar: 2.20, resUses: "Traditional Contextual Rowhouses.", cfUses: "Neighborhood community assets." },
    "R7": { stdFar: 3.44, uapFar: 4.60, resUses: "Medium-High Density Apartments.", cfUses: "Healthcare services, schools." },
    "R7A": { stdFar: 4.00, uapFar: 4.60, resUses: "High-Density Quality Housing.", cfUses: "Ambulatory care assets, schools." },
    "R7X": { stdFar: 5.00, uapFar: 6.00, resUses: "Contextual Multi-Family Envelopes.", cfUses: "Medical facilities, schools, libraries." },
    "R8": { stdFar: 6.02, uapFar: 7.20, resUses: "High-Density Urban Apartments.", cfUses: "Hospitals, full non-profit complexes." },
    "R10": { stdFar: 10.00, uapFar: 12.00, resUses: "Maximum Density Urban Residential.", cfUses: "Full hospitals, research libraries." },
    "C4": { stdFar: 3.40, uapFar: 4.00, resUses: "Mixed-use commercial-residential.", cfUses: "Care assets, local training spaces." },
    "C4-6": { stdFar: 10.00, uapFar: 12.00, resUses: "High-Bulk Commercial Skyscraper Core.", cfUses: "Institutional assets, medical research towers." },
    "M1": { stdFar: 1.00, uapFar: 1.00, resUses: "🚫 Standalone Residential Use prohibited.", cfUses: "Performance standard facilities." }
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
        showLiveLog("BBL not loaded in sandbox. Try Queens: 4, 1323, 44 or Brooklyn: 3, 1964, 1.");
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
        showLiveLog("BBL not loaded in sandbox. Try Queens: 4, 1323, 44 or Brooklyn: 3, 1964, 1.");
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

    var lookup = zoningDictionary[zoning] || { stdFar: 2.00, uapFar: 2.40, resUses: "Housing allowed.", cfUses: "Facility allowed." };
    
    var stdMaxZfa = Math.round(lotArea * lookup.stdFar);
    var uapMaxZfa = Math.round(lotArea * lookup.uapFar);

    document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
    document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";
    document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
    document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

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

    document.getElementById("tableBody").innerHTML = 
        "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right</td><td>Standalone residential and community facility options govern footprints.</td><td>" + specialNotice + "</td></tr>" +
        "<tr><td><b>ZR 23-12</b></td><td>Lot Area & Width Rules</td><td>Minimum lot size criteria determine subdivide allowances.</td><td>Contextual profiles protect pre-existing historic lines.</td></tr>" +
        "<tr><td><b>ZR 23-22 / 34-111</b></td><td>Floor Area Ratio (FAR) Max</td><td>Baseline caps floor area at <b>" + lookup.stdFar.toFixed(2) + " FAR</b> (" + stdMaxZfa.toLocaleString() + " Max SF).</td><td>UAP expands density up to <b>" + lookup.uapFar.toFixed(2) + " FAR</b> (" + uapMaxZfa.toLocaleString() + " Max SF).</td></tr>" +
        "<tr><td><b>ZR 23-431 / 34-111</b></td><td>Yard & Setback Regulations</td><td>Rear open space yards scale back building lines from lot perimeters.</td><td>Zero-lot-line commercial footprints drop yard constraints fully.</td></tr>" +
        "<tr><td><b>ZR 23-432 / 34-111</b></td><td>Height & Base Setbacks</td><td>Baseline capping keeps maximum heights lower (e.g., 125'-0\").</td><td>UAP tracks expand envelope heights higher (e.g., up to 145'-0\").</td></tr>";

    document.getElementById("resultsWrapper").style.display = "block";
}
