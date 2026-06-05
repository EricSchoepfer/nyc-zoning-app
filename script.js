// Universal NYC Suffix-Proof Zoning Code Reference Table
const zoningDictionary = {
  "R1": { stdFar: 0.50, uapFar: 0.50, resUses: "Single-Family Detached Residences.", cfUses: "Basic community facilities." },
  "R2": { stdFar: 0.50, uapFar: 0.50, resUses: "Single-Family Detached Residences.", cfUses: "Basic community facilities." },
  "R3": { stdFar: 0.50, uapFar: 0.60, resUses: "Low-Rise Multi-Family Contextual.", cfUses: "Houses of worship, clinics, schools." },
  "R3A": { stdFar: 0.50, uapFar: 0.60, resUses: "Detached contextual single/two family homes.", cfUses: "Houses of worship, medical practices." },
  "R4": { stdFar: 0.75, uapFar: 0.90, resUses: "Detached/Semi-Detached rowhouses.", cfUses: "Local schools, houses of worship." },
  "R4A": { stdFar: 0.75, uapFar: 0.90, resUses: "Contextual detached residential profiles.", cfUses: "Ambulatory and local learning hubs." },
  "R5": { stdFar: 1.25, uapFar: 1.65, resUses: "Single/Two-Family Rowhouses.", cfUses: "Houses of worship, medical offices." },
  "R5B": { stdFar: 1.35, uapFar: 1.65, resUses: "Contextual traditional multi-rowhouses.", cfUses: "Local nonprofit community assets." },
  "R6": { stdFar: 2.20, uapFar: 3.60, resUses: "Medium-Density Apartment complexes.", cfUses: "Schools, medical centers, libraries." },
  "R6B": { stdFar: 2.00, uapFar: 2.20, resUses: "Traditional Contextual Rowhouses.", cfUses: "Neighborhood community assets." },
  "R7": { stdFar: 3.44, uapFar: 4.60, resUses: "Medium-High Density Apartments.", cfUses: "Healthcare services, schools." },
  "R7A": { stdFar: 4.00, uapFar: 4.60, resUses: "High-Density Quality Housing.", cfUses: "Ambulatory care assets, schools." },
  "R7X": { stdFar: 5.00, uapFar: 6.00, resUses: "Contextual Multi-Family Envelopes.", cfUses: "Medical facilities, schools, libraries." },
  "R8": { stdFar: 6.02, uapFar: 7.20, resUses: "High-Density Urban Apartments.", cfUses: "Hospitals, full non-profit complexes." },
  "R8A": { stdFar: 6.02, uapFar: 7.20, resUses: "High-density Contextual Quality Housing.", cfUses: "Hospitals and broad community facilities." },
  "R10": { stdFar: 10.00, uapFar: 12.00, resUses: "Maximum Density Urban Residential.", cfUses: "Full hospitals, research libraries." },
  "C1": { stdFar: 1.00, uapFar: 1.00, resUses: "Residential paths controlled by underlying overlay.", cfUses: "Broad retail and community space paths." },
  "C2": { stdFar: 2.00, uapFar: 2.00, resUses: "Residential paths controlled by underlying overlay.", cfUses: "Local service shops, repair centers." },
  "C4": { stdFar: 3.40, uapFar: 4.00, resUses: "Mixed-use commercial-residential.", cfUses: "Care assets, local training spaces." },
  "C4-6": { stdFar: 10.00, uapFar: 12.00, resUses: "High-Bulk Commercial Skyscraper Core.", cfUses: "Institutional assets, medical research towers." },
  "M1": { stdFar: 1.00, uapFar: 1.00, resUses: "🚫 Standalone Residential Use prohibited.", cfUses: "Performance standard facilities." }
};

let searchTimeout = null;

// TRACK A: Street Address Lookup
document.getElementById("addressBtn").onclick = function() {
  hideLiveLog();
  var boroCode = document.getElementById("addressBoroSelect").value;
  var addressText = document.getElementById("addressInput").value;

  if (!addressText || addressText.trim() === "") {
    alert("Please enter an address.");
    return;
  }

  document.getElementById("addressBtn").innerText = "Pausing for safety...";
  document.getElementById("addressBtn").disabled = true;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async function() {
    try {
      document.getElementById("addressBtn").innerText = "Querying Master PLUTO...";
      var fullBoroMap = { "MN": "MANHATTAN", "BX": "BRONX", "BK": "BROOKLYN", "QN": "QUEENS", "SI": "STATEN ISLAND" };
      var cleanAddress = addressText.trim().toUpperCase();
      
      // Fixed SoQL Direct API Entry Point for Address Matching
      var url = "https://cityofnewyork.us?" +
                "borough=" + encodeURIComponent(fullBoroMap[boroCode]) + 
                "&address=" + encodeURIComponent(cleanAddress);

      await executeQueryPipeline(url, addressText, "addressBtn", "Search Address Profile");
    } catch(err) {
      resetButton("addressBtn", "Search Address Profile");
      showLiveLog("Address dispatch failure occurred.");
    }
  }, 750);
};

// TRACK B: Borough/Block/Lot Lookup
document.getElementById("bblBtn").onclick = function() {
  hideLiveLog();
  var boro = document.getElementById("boroughInput").value;
  var blockRaw = document.getElementById("blockInput").value;
  var lotRaw = document.getElementById("lotInput").value;

  if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") {
    alert("Fill out BBL fields.");
    return;
  }

  document.getElementById("bblBtn").innerText = "Pausing for safety...";
  document.getElementById("bblBtn").disabled = true;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async function() {
    try {
      document.getElementById("bblBtn").innerText = "Assembling Live Map...";
      var block = String(blockRaw.trim()).padStart(5, '0');
      var lot = String(lotRaw.trim()).padStart(4, '0');
      var computedBbl = boro + block + lot;

      var url = "https://cityofnewyork.us?bbl=" + computedBbl;

      await executeQueryPipeline(url, "BBL Lookup Match", "bblBtn", "Search BBL Profile");
    } catch(err) {
      resetButton("bblBtn", "Search BBL Profile");
      showLiveLog("BBL dispatch failure occurred.");
    }
  }, 750);
};

function resetButton(buttonId, originalButtonText) {
  var btn = document.getElementById(buttonId);
  if (btn) {
    btn.innerText = originalButtonText;
    btn.disabled = false;
  }
}

function showLiveLog(msg) {
  var logger = document.getElementById("liveLog");
  logger.innerText = "System Notice: " + msg;
  logger.style.display = "block";
}

function hideLiveLog() {
  document.getElementById("liveLog").style.display = "none";
}

// LIVE PIPELINE COMPILER ENGINE
async function executeQueryPipeline(queryUrl, fallbackLabel, buttonId, originalButtonText) {
  var finalAddress = fallbackLabel, finalBbl = "N/A", finalZoning = "R6", finalOverlay = "None", finalSpecial = "None", finalLotArea = 4000;

  try {
    var res = await fetch(queryUrl);
    if (!res.ok) throw new Error("Network response error");
    var data = await res.json();

    if (data && data.length > 0) {
      var record = data[0]; // FIX 1: Extract the first record object array map correctly
      
      finalAddress = record.address || fallbackLabel;
      finalBbl = record.bbl || "N/A";
      finalZoning = record.zonedist1 || "R6";
      finalOverlay = record.overlay1 || "None";
      finalSpecial = record.spdist1 || "None";
      finalLotArea = parseFloat(record.lotarea) || finalLotArea;
      
      document.getElementById("resultsWrapper").style.display = "block";
    } else {
      showLiveLog("Location not found in active municipal records. Double-check your spelling or criteria.");
    }
  } catch (err) {
    showLiveLog("API Connection roadblock. Verify parameters or check service pools.");
    console.error(err);
  }

  // FIX 2: Global structural recovery loop resets buttons instantly regardless of script exceptions
  resetButton(buttonId, originalButtonText);

  // Render raw values directly out to HTML interface blocks
  document.getElementById("infoAddress").innerText = finalAddress;
  document.getElementById("infoBbl").innerText = finalBbl;
  document.getElementById("infoZoning").innerText = finalZoning;
  document.getElementById("infoOverlay").innerText = finalOverlay;
  document.getElementById("infoSpecial").innerText = finalSpecial;
  document.getElementById("infoLotArea").innerText = finalLotArea.toLocaleString() + " SF";

  // Suffix Stripping String Parser Machine
  var cleanKey = finalZoning.toUpperCase().replace(/[^A-Z0-9]/g, "");
  var zoneMatch = cleanKey.match(/^([A-Z]+[0-9]+)/);
  
  if (zoneMatch && zoneMatch[1]) {
    cleanKey = zoneMatch[1]; // FIX 3: Pull single string token item out instead of overwriting with the full RegExp Array object
  } else {
    cleanKey = cleanKey.substring(0, 2);
  }

  // Dictionary Lookup Fallbacks
  var lookup = zoningDictionary[cleanKey] || zoningDictionary[cleanKey.substring(0, 2)] || { 
    stdFar: 2.00, uapFar: 2.40, resUses: "Multi-family housing permitted.", cfUses: "Community facility tracks open." 
  };

  var stdMaxZfa = Math.round(finalLotArea * lookup.stdFar);
  var uapMaxZfa = Math.round(finalLotArea * lookup.uapFar);

  document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
  document.getElementById("lblStdMaxSf").innerText = "Max Capacity: " + stdMaxZfa.toLocaleString() + " ZFA SF";
  document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
  document.getElementById("lblUapMaxSf").innerText = "Max Capacity: " + uapMaxZfa.toLocaleString() + " ZFA SF";

  document.getElementById("resUseText").innerHTML = "<b>Permitted (Residences):</b><br>" + lookup.resUses;
  document.getElementById("cfUseText").innerHTML = "<b>Permitted (Community Facilities):</b><br>" + lookup.cfUses;

  var firstLetter = cleanKey.charAt(0);
  if (finalOverlay !== "None" && finalOverlay !== "") {
    document.getElementById("commUseText").innerHTML = "<b>Permitted via Overlay (" + finalOverlay + "):</b><br>Allows ground floor local retail stores (<b>Use Group VI</b>).";
  } else if (firstLetter === "C") {
    document.getElementById("commUseText").innerHTML = "<b>Permitted (Commercial Zone):</b><br>Broad commercial retail operations allowed across all floorplates.";
  } else if (firstLetter === "M") {
    document.getElementById("commUseText").innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows automotive repair workshops, freight hubs, and warehouses.";
  } else {
