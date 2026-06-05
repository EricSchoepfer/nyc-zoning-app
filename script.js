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

window.addEventListener("DOMContentLoaded", () => {
  // TRACK A: Street Address Lookup Wireframe
  const addressBtn = document.getElementById("addressBtn");
  if (addressBtn) {
    addressBtn.onclick = function() {
      hideLiveLog();
      var boroCode = document.getElementById("addressBoroSelect").value;
      var addressText = document.getElementById("addressInput").value;

      if (!addressText || addressText.trim() === "") {
        alert("Please enter an address.");
        return;
      }

      addressBtn.innerText = "Pausing for safety...";
      addressBtn.disabled = true;

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async function() {
        try {
          addressBtn.innerText = "Querying ZoLa Engine...";
          var fullBoroMap = { "MN": "Manhattan", "BX": "Bronx", "BK": "Brooklyn", "QN": "Queens", "SI": "Staten Island" };
          var searchString = addressText.trim() + ", " + fullBoroMap[boroCode] + ", NY";
          
          // Mimics a browser searching directly on ZoLa via the Planning Labs search index gateway
          var url = "https://planninglabs.nyc" + encodeURIComponent(searchString);

          await executeQueryPipeline(url, addressText, "addressBtn", "Search Address Profile", true);
        } catch(err) {
          resetButton("addressBtn", "Search Address Profile");
          showLiveLog("ZoLa network link interface dropped response maps.");
        }
      }, 750);
    };
  }

  // TRACK B: Borough/Block/Lot Lookup Wireframe
  const bblBtn = document.getElementById("bblBtn");
  if (bblBtn) {
    bblBtn.onclick = function() {
      hideLiveLog();
      var boro = document.getElementById("boroughInput").value;
      var blockRaw = document.getElementById("blockInput").value;
      var lotRaw = document.getElementById("lotInput").value;

      if (!boro || !blockRaw || blockRaw.trim() === "" || !lotRaw || lotRaw.trim() === "") {
        alert("Fill out BBL fields.");
        return;
      }

      bblBtn.innerText = "Pausing for safety...";
      bblBtn.disabled = true;

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async function() {
        try {
          bblBtn.innerText = "Connecting Tax Map...";
          var block = String(blockRaw.trim()).padStart(5, '0');
          var lot = String(lotRaw.trim()).padStart(4, '0');
          var computedBbl = boro + block + lot;

          // Hits ZoLa's reverse geographical coordinate parsing API directly by specific tax block/lot keys
          var url = "https://cityofnewyork.us" + computedBbl;

          await executeQueryPipeline(url, "BBL Lookup Match", "bblBtn", "Search BBL Profile", false);
        } catch(err) {
          resetButton("bblBtn", "Search BBL Profile");
          showLiveLog("Tax API routing layout failure occurred.");
        }
      }, 750);
    };
  }
});

function resetButton(buttonId, originalButtonText) {
  var btn = document.getElementById(buttonId);
  if (btn) {
    btn.innerText = originalButtonText;
    btn.disabled = false;
  }
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

// LIVE PIPELINE COMPILER ENGINE - DUAL SCHEMATIC PARSER
async function executeQueryPipeline(queryUrl, fallbackLabel, buttonId, originalButtonText, isZoLaGeosearch) {
  var finalAddress = fallbackLabel, finalBbl = "N/A", finalZoning = "R6", finalOverlay = "None", finalSpecial = "None", finalLotArea = 4000;

  try {
    var res = await fetch(queryUrl);
    if (!res.ok) throw new Error("Server transmission error");
    var data = await res.json();

    if (isZoLaGeosearch) {
      // TRACK A: Processes standard browser payload structures used natively by ZoLa's autocomplete UI
      if (data && data.features && data.features.length > 0) {
        var properties = data.features[0].properties;
        finalAddress = properties.label || fallbackLabel;
        finalBbl = properties.pad_bbl || "N/A";
        
        // Secondary execution link chain fetches specific zoning shapes utilizing the recovered BBL code configuration
        if (finalBbl !== "N/A") {
          var backupUrl = "https://cityofnewyork.us" + finalBbl;
          var backupRes = await fetch(backupUrl);
          if (backupRes.ok) {
            var backupData = await backupRes.json();
            if (backupData && backupData.length > 0) {
              var plutoRecord = backupData[0];
              finalZoning = plutoRecord.zonedist1 || "R6";
              finalOverlay = plutoRecord.overlay1 || "None";
              finalSpecial = plutoRecord.spdist1 || "None";
              finalLotArea = parseFloat(plutoRecord.lotarea) || finalLotArea;
            }
          }
        }
        document.getElementById("resultsWrapper").style.display = "block";
      } else {
        showLiveLog("ZoLa text engine could not match address spelling string layouts.");
      }
    } else {
      // TRACK B: Direct tax registry extraction format parameters 
      if (data && data.length > 0) {
        var record = data[0];
        finalAddress = record.address || fallbackLabel;
        finalBbl = record.bbl || "N/A";
        finalZoning = record.zonedist1 || "R6";
        finalOverlay = record.overlay1 || "None";
        finalSpecial = record.spdist1 || "None";
        finalLotArea = parseFloat(record.lotarea) || finalLotArea;
        
        document.getElementById("resultsWrapper").style.display = "block";
      } else {
        showLiveLog("BBL coordinates match no registered municipal footprint records.");
      }
    }
  } catch (err) {
    showLiveLog("Connection sequence stalled inside remote data pools.");
    console.error(err);
  }

  // Safety Unlock sequence overrides interface freeze anomalies 
  resetButton(buttonId, originalButtonText);

  // Write variables straight to DOM target nodes
  document.getElementById("infoAddress").innerText = finalAddress;
  document.getElementById("infoBbl").innerText = finalBbl;
  document.getElementById("infoZoning").innerText = finalZoning;
  document.getElementById("infoOverlay").innerText = finalOverlay;
  document.getElementById("infoSpecial").innerText = finalSpecial;
  document.getElementById("infoLotArea").innerText = finalLotArea.toLocaleString() + " SF";

  // Regex string extractor removes design suffix masks without array mutation drops
  var cleanKey = finalZoning.toUpperCase().replace(/[^A-Z0-9]/g, "");
  var zoneMatch = cleanKey.match(/^([A-Z]+[0-9]+)/);
  if (zoneMatch && zoneMatch[1]) {
    cleanKey = zoneMatch[1];
  } else {
    cleanKey = cleanKey.substring(0, 2);
  }

