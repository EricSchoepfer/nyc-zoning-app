// Complete NYC District Multi-Track FAR Reference Sheet
const zoningDictionary = {
    "R5": { stdFar: 1.25, uapFar: 1.65, resUses: "Single/Two-Family Rowhouses, Detached, Semi-Detached and Small Multi-Family Apartments", cfUses: "Houses of worship, medical offices, non-profit institutions without sleeping accommodations, and schools." },
    "R6": { stdFar: 2.20, uapFar: 3.60, resUses: "Medium-Density Apartment complexes, Quality Housing or Traditional Height Factor layouts.", cfUses: "Schools, neighborhood medical centers, libraries, community centers, philanthropic houses." },
    "R7": { stdFar: 3.44, uapFar: 4.60, resUses: "Medium-High Density Apartments, Quality Housing Option framework optimizations.", cfUses: "Ambulatory healthcare services, full educational facilities, houses of worship." },
    "R7X": { stdFar: 5.00, uapFar: 6.00, resUses: "Contextual Multi-Family Envelopes. Strict front street walls and standard residential configurations allowed.", cfUses: "Ambulatory medical facilities, schools, libraries, non-profit institutions." },
    "R8": { stdFar: 6.02, uapFar: 7.20, resUses: "High-Density Urban Apartments, tower configurations or high-bulk contextual layouts.", cfUses: "Hospitals, full non-profit complexes, higher learning universities, and houses of worship." },
    "R10": { stdFar: 10.00, uapFar: 12.00, resUses: "Maximum Density Urban Residential Towers, high-capacity luxury and affordable options.", cfUses: "Full hospitals, research libraries, community headquarters, institutional facilities." },
    "C4": { stdFar: 3.40, uapFar: 4.00, resUses: "Mixed-use commercial-residential apartment variants allowed inside shopping clusters.", cfUses: "Ambulatory care assets, local training spaces, community facility layouts." }
};

document.getElementById("searchBtn").addEventListener("click", async function() {
    var rawAddress = document.getElementById("addressInput").value;
    if (!rawAddress || rawAddress.trim() === "") { alert("Please type an address first."); return; }

    var searchBtn = document.getElementById("searchBtn");
    searchBtn.innerText = "Connecting ZoLa Pipeline...";
    searchBtn.disabled = true;

    // Blueprint defaults if network errors strike
    var finalAddress = rawAddress;
    var finalZoning = "R7X";
    var finalOverlay = "C2-3";
    var finalSpecial = "None";
    var finalBbl = "4013230044"; 
    var finalLotArea = 10000; // 10,000 SF fallback default

    try {
        // Step A: Request Geosupport to target the property BBL profile
        var geoUrl = "https://planninglabs.nyc" + encodeURIComponent(rawAddress);
        var geoRes = await fetch(geoUrl);
        var geoData = await geoRes.json();

        if (geoData.features && geoData.features.length > 0) {
            var props = geoData.features.properties;
            finalAddress = props.label || rawAddress;
            finalZoning = props.zone_dist1 || "R7X";
            finalOverlay = props.commercial_overlay1 || "None";
            finalSpecial = props.special_district1 || "None";
            
            // Build the absolute 10-digit BBL code string needed to pull MapPLUTO data
            var boroCode = props.pad_boro || "4"; 
            var blockCode = String(props.block || "1323").padStart(5, '0');
            var lotCode = String(props.lot || "44").padStart(4, '0');
            finalBbl = boroCode + blockCode + lotCode;
        }

        // Step B: Query Carto Data API to pull the actual Lot Area square footage from PLUTO
        var plutoUrl = "https://cityofnewyork.us" + finalBbl;
        var plutoRes = await fetch(plutoUrl);
        var plutoData = await plutoRes.json();

        if (plutoData && plutoData.length > 0) {
            finalLotArea = parseFloat(plutoData[0].lotarea) || 10000;
        }
    } catch (err) {
        console.warn("Live PLUTO API blocked or unmapped. Drawing baseline layout geometry defaults.");
    }

    processMetricsAndLayout(finalAddress, finalZoning, finalOverlay, finalSpecial, finalBbl, finalLotArea);
    
    searchBtn.innerText = "Generate Analysis Guide";
    searchBtn.disabled = false;
});

function processMetricsAndLayout(address, zoning, overlay, special, bbl, lotArea) {
    document.getElementById("infoAddress").innerText = address;
    document.getElementById("infoZoning").innerText = zoning;
    document.getElementById("infoOverlay").innerText = overlay;
    document.getElementById("infoSpecial").innerText = special;
    document.getElementById("infoLotArea").innerText = lotArea.toLocaleString() + " SF";

    // Clean text string cleanup logic to catch variants (e.g., "R7X" -> "R7X", "R6B" -> "R6")
    var cleanKey = zoning.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!zoningDictionary[cleanKey]) {
        if (cleanKey.startsWith("R")) {
            cleanKey = "R" + cleanKey.replace(/\D/g, "");
            if (zoning.toUpperCase().includes("X")) cleanKey += "X";
        }
    }

    var lookup = zoningDictionary[cleanKey] || { stdFar: 2.00, uapFar: 2.40, resUses: "Standard multi-family apartment uses allowed.", cfUses: "Standard community facility applications allowed." };

    // Process Live Bulk Area Math
    var stdMaxZfa = Math.round(lotArea * lookup.stdFar);
    var uapMaxZfa = Math.round(lotArea * lookup.uapFar);

    document.getElementById("lblStdFar").innerText = lookup.stdFar.toFixed(2) + " FAR";
    document.getElementById("lblStdMaxSf").innerText = "Max Allowable: " + stdMaxZfa.toLocaleString() + " ZFA SF";

    document.getElementById("lblUapFar").innerText = lookup.uapFar.toFixed(2) + " FAR";
    document.getElementById("lblUapMaxSf").innerText = "Max Allowable: " + uapMaxZfa.toLocaleString() + " ZFA SF";

    var letter = zoning.charAt(0).toUpperCase();

    // 1. Output All Permitted Uses
    document.getElementById("resUseText").innerHTML = "<b>Permitted (Use Group II - Residences):</b><br>" + lookup.resUses;
    document.getElementById("cfUseText").innerHTML = "<b>Permitted (Use Group III - Community Facilities):</b><br>" + lookup.cfUses;

    if (overlay !== "None" && overlay !== "") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted via Overlay (" + overlay + "):</b><br>Allows ground floor and second story local retail stores, dry cleaners, grocery networks, pharmacies, and neighborhood restaurants (<b>Use Group VI</b>) up to a 1.0 - 2.0 FAR envelope cap.";
    } else if (letter === "C") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Commercial Zone):</b><br>Full commercial operations allowed across all open structural floorplates. Unlocks major regional shopping centers, corporate suites, and local service networks (<b>Use Groups V-VIII</b>).";
    } else if (letter === "M") {
        document.getElementById("commUseText").innerHTML = "<b>Permitted (Manufacturing Zone):</b><br>Allows auto showrooms, warehouse depots, wholesale distributors, repair stations, and production centers (<b>Use Groups IX-XI</b>).";
    } else {
        document.getElementById("commUseText").innerHTML = "<b>🚫 Commercial Restricted:</b><br>No commercial overlay options exist on this parcel. Ground level retail spaces are disallowed.";
    }

    var specialNotice = "Standard underlying city-wide framework text rules apply.";
    if (special !== "None" && special !== "") {
        specialNotice = "<b style='color:var(--mandatory-color)'>⚠️ Special District Overrides Active (" + special + "):</b> Mapped within a custom Special District. Custom text amendments, street walls, and massing rules take absolute priority.";
    }

    // 2. Render Original Table Layout with Specific ZR Citations
    document.getElementById("tableBody").innerHTML = 
        "<tr><td><b>ZR 22-12 / 32-16</b></td><td>Uses Permitted As-Of-Right</td><td>Standalone residential and community facility options govern the land parcel footprints.</td><td>" + specialNotice + "</td></tr>" +
        "<tr><td><b>ZR 23-12</b></td><td>Lot Area & Width Rules</td><td>Minimum lot size criteria determine absolute structural subdivide allowances.</td><td>Contextual profiles protect pre-existing historic narrower lot lines.</td></tr>" +
        "<tr><td><b>ZR 23-22 / 34-111</b></td><td>Floor Area Ratio (FAR) Max</td><td>Standard baseline track caps layout floor area at <b>" + lookup.stdFar.toFixed(2) + " FAR</b> (" + stdMaxZfa.toLocaleString() + " Max SF).</td><td>Universal Affordable Housing (UAP) expands density up to <b>" + lookup.uapFar.toFixed(2) + " FAR</b> (" + uapMaxZfa.toLocaleString() + " Max SF).</td></tr>" +
        "<tr><td><b>ZR 23-431 / 34-111</b></td><td>Yard & Setback Regulations</td><td>Standard rear open space yard requirements scale back building lines from lot perimeters.</td><td>Zero-lot-line multi-variant commercial footprints drop yard constraints fully.</td></tr>" +
        "<tr><td><b>ZR 23-432 / 34-111</b></td><td>Height & Base Setbacks</td><td>Standard envelope capping keeps maximum heights lower (e.g., 125'-0\" ceiling heights).</td><td>UAP contextual tracks expand envelope heights higher (e.g., up to 145'-0\" roof profiles).</td></tr>";

    // Unhide panels
    document.getElementById("resultsWrapper").classList.remove("hidden");
}
