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

// Global Initialization Wrapper maps tracking paths securely
function initTracker() {
  console.log("Zoning matrix system ready.");

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
      var url = "https://cityofnewyork.us?" +
                "&$where=bbl=" + rawBbl + " OR bbl='" + rawBbl + "'";

      await executeQueryPipeline(url, "BBL Lookup Match", "bblBtn", "Search BBL Profile");
    };
  }
}

// Resilient load listener maps button triggers regardless of link script order layouts
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

// LIVE PIPELINE COMPILER ENGINE
async function executeQueryPipeline(queryUrl, fallbackLabel, buttonId, originalButtonText) {
  var finalAddress = fallbackLabel, finalBbl = "N/A", finalZoning = "R6", finalOverlay = "None", finalSpecial = "None", finalLotArea = 4000;

  try {
    var res = await fetch(queryUrl);
    var data = await res.json();

    if (data && data.length > 0) {
      // FIXED HERE: Target index 0 inside the API array container safely
      var record = data[0]; 
      finalAddress = record.address || fallbackLabel;
      finalBbl = record.bbl || "N/A";
      finalZoning = record.zonedist1 || "R6";
      finalOverlay = record.overlay1 || "None";
      finalSpecial = record.spdist1 || "None";
      finalLotArea = parseFloat(record.lotarea) || finalLotArea;
      
      var wrapper = document.getElementById("resultsWrapper");
      if (wrapper) wrapper.style.display = "block";
    } else {
      showLiveLog("Location data match empty inside database registries.");
    }
  } catch (err) {
    showLiveLog("API Route roadblock encountered.");
    console.error(err);
  }

  // Release button lock state safely
  var btn = document.getElementById(buttonId);
  if (btn) {
    btn.innerText = originalButtonText;
    btn.disabled = false;
  }

  // Print text strings out to workspace container nodes
  if (document.getElementById("infoAddress")) document.getElementById("infoAddress").innerText = finalAddress;
  if (document.getElementById("infoBbl")) document.getElementById("infoBbl").innerText = finalBbl;
  if (document.getElementById("infoZoning")) document.getElementById("infoZoning").innerText = finalZoning;
  if (document.getElementById("infoOverlay")) document.getElementById("infoOverlay").innerText = finalOverlay;
  if (document.getElementById("infoSpecial")) document.getElementById("infoSpecial").innerText = finalSpecial;
  if (document.getElementById("infoLotArea")) document.getElementById("infoLotArea").innerText = finalLotArea.toLocaleString() + " SF";

  // Suffix strip parser string sanitization machine
  var cleanKey = "R6";
  if (finalZoning) {
    var parsed = finalZoning.toUpperCase().replace(/[^A-Z0-9]/g, "");
    var matches = parsed.match(/^([A-Z]+[0-9]+)/);
    if (matches && matches[1]) {
      // FIXED HERE: Pull item index 1 from the regular expression match array container
      cleanKey = matches[1]; 
    } else {
      cleanKey = parsed.substring(0, 2);
    }
  }

  var lookup = zoningDictionary[cleanKey] || zoningDictionary[cleanKey.substring(0, 2)] || { stdFar: 2.00, uapFar: 2.40, resUses: "Multi-family housing.", cfUses: "Community facility open." };

  var stdMaxZfa = Math.round(finalLotArea * lookup.stdFar);
  var uapMaxZfa = Math.round(finalLotArea * lookup.uapFar);

  if (document.getElementById("lblStdFar")) document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
  if (document.getElementById("lblStdMaxSf")) document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";
  if (document.getElementById("lblUapFar")) document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
  if (document.getElementById("lblUapMaxSf")) document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

  if (document.getElementById("resUseText")) document.getElementById("resUseText").innerHTML = "<b>Permitted (Residences):</b><br>" + lookup.resUses;
  if (document.getElementById("cfUseText")) document.getElementById("cfUseText").innerHTML = "<b>Permitted (Community Facilities):</b><br>" + lookup.cfUses;

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
    specialNotice = "<b style='color:#ef4444'>⚠️ Special District Active (" + finalSpecial + "):</b> Custom setbacks take absolute priority.";
  }

  var table = document.getElementById("tableBody");
  if (table) {
    table.innerHTML = 
