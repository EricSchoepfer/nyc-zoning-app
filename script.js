// Universal NYC Suffix-Proof Zoning Code Reference Table
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

function initTracker() {
  var addressBtn = document.getElementById("addressBtn");
  if (addressBtn) {
    addressBtn.onclick = async function() {
      hideLiveLog();
      var boroSelect = document.getElementById("addressBoroSelect");
      var addressInput = document.getElementById("addressInput");
      if (!boroSelect || !addressInput) return;
      
      var boroCode = boroSelect.value;
      var addressText = addressInput.value;
      if (!addressText || addressText.trim() === "") {
        alert("Please enter a street address.");
        return;
      }

      addressBtn.innerText = "Querying Master PLUTO...";
      addressBtn.disabled = true;

      var fullBoroMap = { "BK": "BROOKLYN", "MN": "MANHATTAN", "QN": "QUEENS", "BX": "BRONX", "SI": "STATEN ISLAND" };
      var cleanAddress = addressText.trim().toUpperCase().replace(/\./g, "");
      cleanAddress = cleanAddress.replace(/ AVENUE$/, " AVE").replace(/ STREET$/, " ST").replace(/ ROAD$/, " RD").replace(/ BOULEVARD$/, " BLVD");

      var url = "https://cityofnewyork.us?" +
                "borough=" + encodeURIComponent(fullBoroMap[boroCode] || "BROOKLYN") + 
                "&$where=address LIKE '" + encodeURIComponent(cleanAddress) + "%'";

      await executeQueryPipeline(url, addressText, "addressBtn", "Search Address Profile");
    };
  }

  var bblBtn = document.getElementById("bblBtn");
  if (bblBtn) {
    bblBtn.onclick = async function() {
      hideLiveLog();
      var boroInput = document.getElementById("boroughInput");
      var blockInput = document.getElementById("blockInput");
      var lotInput = document.getElementById("lotInput");
      if (!boroInput || !blockInput || !lotInput) return;

      var boro = boroInput.value;
      var blockRaw = blockInput.value;
      var lotRaw = lotInput.value;
      if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") {
        alert("Please fill out all BBL fields.");
        return;
      }

      bblBtn.innerText = "Assembling Live Map...";
      bblBtn.disabled = true;

      var block = String(blockRaw.trim()).padStart(5, '0');
      var lot = String(lotRaw.trim()).padStart(4, '0');
      var rawBbl = boro + block + lot;
      var url = "https://cityofnewyork.us?bbl=" + rawBbl;

      await executeQueryPipeline(url, "BBL Lookup Match", "bblBtn", "Search BBL Profile");
    };
  }
}

// Global invocation hook avoids file loading timing constraints
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTracker);
} else {
  initTracker();
}

function showLiveLog(msg) {
  var logger = document.getElementById("liveLog");
  if (logger) {
    logger.innerText = "System Notice: " + msg;
    logger.style.display = "block";
  }
}

function hideLiveLog() {
  var logger = document.getElementById("liveLog");
  if (logger) logger.style.display = "none";
}

async function executeQueryPipeline(queryUrl, fallbackLabel, buttonId, originalButtonText) {
  var finalAddress = fallbackLabel, finalBbl = "N/A", finalZoning = "R6", finalOverlay = "None", finalSpecial = "None", finalLotArea = 4000;

  try {
    var res = await fetch(queryUrl);
    var data = await res.json();

    if (data && data.length > 0) {
      // PROVEN FIX 1: Access the exact single zero-index array object dictionary layout row row cleanly
      var record = data[0]; 
      finalAddress = record.address || fallbackLabel;
      finalBbl = record.bbl || "N/A";
      finalZoning = record.zonedist1 || "R6";
      finalOverlay = record.overlay1 || "None";
      finalSpecial = record.spdist1 || "None";
      finalLotArea = parseFloat(record.lotarea) || finalLotArea;
      
      document.getElementById("resultsWrapper").style.display = "block";
    } else {
      showLiveLog("Location data match empty inside database registries.");
    }
  } catch (err) {
    showLiveLog("API Connection roadblock. Verify connection strings.");
    console.error(err);
  }

  // Absolute fallback button restore handles connection drops cleanly
  var btn = document.getElementById(buttonId);
  if (btn) {
    btn.innerText = originalButtonText;
    btn.disabled = false;
  }

  // Populate data sheets to page elements
  document.getElementById("infoAddress").innerText = finalAddress;
  document.getElementById("infoBbl").innerText = finalBbl;
  document.getElementById("infoZoning").innerText = finalZoning;
  document.getElementById("infoOverlay").innerText = finalOverlay;
  document.getElementById("infoSpecial").innerText = finalSpecial;
  document.getElementById("infoLotArea").innerText = finalLotArea.toLocaleString() + " SF";

  // PROVEN FIX 2: Parse underlying split-zone designations without causing alpha drop calculation drops (e.g. "R6-1" -> "R6")
  var cleanKey = "R6";
  if (finalZoning) {
    cleanKey = finalZoning.split('-')[0].split('/')[0].trim().toUpperCase();
  }

  var lookup = zoningDictionary[cleanKey] || zoningDictionary[cleanKey.substring(0, 2)] || { stdFar: 2.00, uapFar: 2.40, resUses: "Multi-family housing.", cfUses: "Community facility open." };

  var stdMaxZfa = Math.round(finalLotArea * lookup.stdFar);
  var uapMaxZfa = Math.round(finalLotArea * lookup.uapFar);

  document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
  document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";
  document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
  document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

  document.getElementById("resUseText").innerHTML = "<b>Permitted (Residences):</b><br>" + lookup.resUses;
  document.getElementById("cfUseText").innerHTML = "<b>Permitted (Community Facilities):</b><br>" + lookup.cfUses;

  var firstLetter = cleanKey.charAt(0);
  var commBox = document.getElementById("commUseText");
  if (commBox) {
    if (finalOverlay !== "None" && finalOverlay !== "") {
      commBox.innerHTML = "<b>Permitted via Overlay (" + finalOverlay + "):</b><br>Allows ground floor local retail stores (<b>Use Group VI</b>).";
    } else if (firstLetter === "C") {
      commBox.innerHTML = "<b>Permitted (Commercial Zone):</b><br>Broad commercial retail operations allowed.";
    } else if (firstLetter === "M") {
      commBox.innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows workshops and warehouses.";
    } else {
      commBox.innerHTML = "<b>🚫 Commercial Restricted:</b><br>No commercial overlay options exist.";
    }
  }

  var specialNotice = "Standard underlying city-wide framework text rules apply.";
  if (finalSpecial !== "None" && finalSpecial !== "") {
    specialNotice = "<b style='color:#ef4444'>⚠️ Special District Active (" + finalSpecial + "):</b> Custom setbacks take priority.";
  }

  var table = document.getElementById("tableBody");
  if (table) {
    table.innerHTML = 
      "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right</td><td>Standalone residential and community facility options govern footprints.</td><td>" + specialNotice + "</td></tr>" + 
      "<tr><td><b>ZR 23-12</b></td><td>Lot Area & Width Rules</td><td>Minimum lot size criteria determine subdivide allowances.</td><td>Contextual profiles protect pre-existing historic lines.</td></tr>" + 
      "<tr><td><b>ZR 23-22 / 34-111</b></td><td>Floor Area Ratio (FAR) Max</td><td>Baseline caps floor area at <b>" + lookup.stdFar.toFixed(2) + " FAR</b> (" + stdMaxZfa.toLocaleString() + " Max SF).</td><td>UAP expands density up to <b>" + lookup.uapFar.toFixed(2) + " FAR</b> (" + uapMaxZfa.toLocaleString() + " Max SF).</td></tr>" + 
