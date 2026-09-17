/* =========================
   NAVIGATION
========================= */

const titles = {
    dashboard: "Dashboard",
    world: "World Clock",
    calculator: "Calculator",
    network: "Network Tools",
    developer: "Developer Tools",
    timers: "Timers",
    system: "System Dashboard",
    notes: "Notes"
};


function showSection(id) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document.getElementById(id)
        .classList.add("active");

    document.querySelectorAll(".nav-btn")
        .forEach(button => {
            button.classList.remove("active");
        });

    document.getElementById("page-title")
        .textContent = titles[id];

    if (id === "world") {
    setTimeout(() => {
        resizeGlobe();
    }, 300);
}

    if (id === "system") {
        loadSystemInfo();
    }
}


/* =========================
   MAIN CLOCK
========================= */

function updateMainClock() {

    const now = new Date();

    document.getElementById("main-clock")
        .textContent =
        now.toLocaleTimeString("en-IN", {
            hour12: false
        });

    document.getElementById("main-date")
        .textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

setInterval(updateMainClock, 1000);

updateMainClock();


/* =========================
   HEALTH
========================= */

async function checkHealth() {

    const output =
        document.getElementById(
            "health-result"
        );

    try {

        const response =
            await fetch("/health");

        const data =
            await response.json();

        output.innerHTML =
            `<br>🟢 ${data.status.toUpperCase()}<br>
             Uptime: ${data.uptime}s`;

    } catch {

        output.innerHTML =
            "<br>🔴 API unavailable";

    }
}


/* =========================
   CALCULATOR
========================= */

let expression = "";


function updateCalculator() {

    document.getElementById(
        "calc-display"
    ).value =
        expression || "0";
}


function appendCalc(value) {

    if (expression === "Error") {
        expression = "";
    }

    expression += value;

    updateCalculator();
}


function clearCalc() {

    expression = "";

    updateCalculator();
}


function deleteCalc() {

    expression =
        expression.slice(0, -1);

    updateCalculator();
}


function squareCalc() {

    try {

        const value =
            Function(
                `"use strict"; return (${expression})`
            )();

        expression =
            String(value * value);

    } catch {

        expression = "Error";

    }

    updateCalculator();
}


function calculate() {

    try {

        const result =
            Function(
                `"use strict"; return (${expression.replaceAll("%", "/100")})`
            )();

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        expression = String(result);

    } catch {

        expression = "Error";

    }

    updateCalculator();
}

/* =========================================
   3D WORLD CLOCK
========================================= */

let globe;
let selectedCountry = null;
let countryData = [];


/*
   Country → timezone mapping.

   We keep this on the frontend so the
   globe can immediately display the
   correct live time.
*/

const countryTimezones = {

    "India": "Asia/Kolkata",
    "United States": "America/New_York",
    "Canada": "America/Toronto",
    "Mexico": "America/Mexico_City",

    "United Kingdom": "Europe/London",
    "Ireland": "Europe/Dublin",

    "France": "Europe/Paris",
    "Germany": "Europe/Berlin",
    "Italy": "Europe/Rome",
    "Spain": "Europe/Madrid",
    "Portugal": "Europe/Lisbon",
    "Netherlands": "Europe/Amsterdam",
    "Belgium": "Europe/Brussels",
    "Switzerland": "Europe/Zurich",
    "Austria": "Europe/Vienna",
    "Poland": "Europe/Warsaw",
    "Greece": "Europe/Athens",
    "Sweden": "Europe/Stockholm",
    "Norway": "Europe/Oslo",
    "Finland": "Europe/Helsinki",
    "Denmark": "Europe/Copenhagen",

    "Russia": "Europe/Moscow",
    "Turkey": "Europe/Istanbul",

    "Japan": "Asia/Tokyo",
    "South Korea": "Asia/Seoul",
    "China": "Asia/Shanghai",
    "Mongolia": "Asia/Ulaanbaatar",

    "Singapore": "Asia/Singapore",
    "Malaysia": "Asia/Kuala_Lumpur",
    "Thailand": "Asia/Bangkok",
    "Vietnam": "Asia/Ho_Chi_Minh",
    "Indonesia": "Asia/Jakarta",
    "Philippines": "Asia/Manila",

    "Nepal": "Asia/Kathmandu",
    "Bangladesh": "Asia/Dhaka",
    "Pakistan": "Asia/Karachi",
    "Sri Lanka": "Asia/Colombo",

    "United Arab Emirates": "Asia/Dubai",
    "Saudi Arabia": "Asia/Riyadh",
    "Qatar": "Asia/Qatar",
    "Israel": "Asia/Jerusalem",

    "Australia": "Australia/Sydney",
    "New Zealand": "Pacific/Auckland",

    "Brazil": "America/Sao_Paulo",
    "Argentina": "America/Argentina/Buenos_Aires",
    "Chile": "America/Santiago",
    "Colombia": "America/Bogota",
    "Peru": "America/Lima",

    "South Africa": "Africa/Johannesburg",
    "Egypt": "Africa/Cairo",
    "Nigeria": "Africa/Lagos",
    "Kenya": "Africa/Nairobi",
    "Morocco": "Africa/Casablanca"
};


/* =========================================
   COUNTRY FLAGS
========================================= */

const countryFlags = {

    India: "🇮🇳",
    "United States": "🇺🇸",
    Canada: "🇨🇦",
    Mexico: "🇲🇽",

    "United Kingdom": "🇬🇧",
    Ireland: "🇮🇪",

    France: "🇫🇷",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Portugal: "🇵🇹",

    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    China: "🇨🇳",

    Singapore: "🇸🇬",
    Malaysia: "🇲🇾",
    Thailand: "🇹🇭",
    Indonesia: "🇮🇩",

    Nepal: "🇳🇵",
    Bangladesh: "🇧🇩",
    Pakistan: "🇵🇰",

    "United Arab Emirates": "🇦🇪",
    "Saudi Arabia": "🇸🇦",

    Australia: "🇦🇺",
    "New Zealand": "🇳🇿",

    Brazil: "🇧🇷",
    Argentina: "🇦🇷",
    Chile: "🇨🇱",

    "South Africa": "🇿🇦",
    Egypt: "🇪🇬",
    Nigeria: "🇳🇬",
    Kenya: "🇰🇪"
};


/* =========================================
   LOAD REAL WORLD COUNTRY DATA
========================================= */

async function loadWorldGlobe() {

    try {

        const response = await fetch(
            "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        );

        const geojson =
            await response.json();

        countryData =
            geojson.features;

        createGlobe(countryData);

    } catch (error) {

        console.error(
            "Unable to load world map:",
            error
        );

    }
}


/* =========================================
   CREATE 3D GLOBE
========================================= */

function createGlobe(countries) {

    globe = Globe()(

        document.getElementById("globe")

    )

    /*
       Real Earth texture
    */

    .globeImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
    )

    /*
       Earth elevation
    */

    .bumpImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
    )

    /*
       Stars / space background
    */

    .backgroundImageUrl(
        "https://unpkg.com/three-globe/example/img/night-sky.png"
    )

    /*
       Atmosphere
    */

    .showAtmosphere(true)

    .atmosphereColor(
        "#38bdf8"
    )

    .atmosphereAltitude(
        0.20
    )

    /*
       Country polygons
    */

    .polygonsData(countries)

    .polygonAltitude(0.008)

    .polygonCapColor(
        feature => {

            const name =
                feature.properties.name;

            if (
                selectedCountry &&
                name === selectedCountry
            ) {

                return "rgba(34,211,238,0.65)";

            }

            return "rgba(15,118,110,0.18)";
        }
    )

    .polygonSideColor(
        () =>
            "rgba(34,211,238,0.25)"
    )

    .polygonStrokeColor(
        () =>
            "rgba(103,232,249,0.65)"
    )

    .polygonLabel(
        feature => {

            const name =
                feature.properties.name;

            return `
                <div style="
                    padding:8px 12px;
                    border-radius:8px;
                    background:#020617;
                    color:#67e8f9;
                    font-family:Arial;
                    font-size:12px;
                ">
                    🌍 ${name}
                </div>
            `;
        }
    )

    /*
       Country click
    */

    .onPolygonClick(
        feature => {

            const name =
                feature.properties.name;

            selectCountry(name);

        }
    )

    /*
       Hover
    */

    .onPolygonHover(
        feature => {

            const name =
                feature
                ? feature.properties.name
                : null;

            document.body.style.cursor =
                name
                    ? "pointer"
                    : "default";
        }
    );


    /*
       Initial Earth position
    */

    globe.pointOfView({
        lat: 20,
        lng: 78,
        altitude: 2.2
    });


    /*
       Controls
    */

    const controls =
        globe.controls();

    controls.autoRotate = true;

    controls.autoRotateSpeed = 0.35;

    controls.enableZoom = true;

    controls.minDistance = 120;

    controls.maxDistance = 500;


    /*
       Stop automatic rotation
       when user interacts.
    */

    controls.addEventListener(
        "start",
        () => {

            controls.autoRotate =
                false;

        }
    );


    /*
       Resize
    */

    resizeGlobe();

}


/* =========================================
   RESIZE GLOBE
========================================= */

function resizeGlobe() {

    if (!globe)
        return;

    const container =
        document.getElementById(
            "globe"
        );

    globe
        .width(
            container.clientWidth
        )
        .height(
            container.clientHeight
        );
}


window.addEventListener(
    "resize",
    resizeGlobe
);


/* =========================================
   SELECT COUNTRY
========================================= */

function selectCountry(country) {

    selectedCountry =
        country;


    const timezone =
        countryTimezones[country];


    /*
       Update UI
    */

    document.getElementById(
        "country-name"
    ).textContent =
        country;


    document.getElementById(
        "country-flag"
    ).textContent =
        countryFlags[country] || "🌍";


    if (!timezone) {

        document.getElementById(
            "country-time"
        ).textContent =
            "Timezone unavailable";

        document.getElementById(
            "country-zone"
        ).textContent =
            "Not configured";

        return;
    }


    /*
       Focus globe on country
    */

    const feature =
        countryData.find(
            item =>
                item.properties.name === country
        );


    if (feature) {

        const center =
            calculateCountryCenter(
                feature
            );

        if (center) {

            globe.pointOfView(
                {
                    lat: center.lat,
                    lng: center.lng,
                    altitude: 1.8
                },
                1000
            );

        }

    }


    updateSelectedCountry();


    /*
       Refresh polygon colors
    */

    globe.polygonsData(
        [...countryData]
    );
}


/* =========================================
   COUNTRY CENTER
========================================= */

function calculateCountryCenter(
    feature
) {

    try {

        const coordinates =
            feature.geometry.coordinates;

        let points = [];


        function collect(
            array
        ) {

            if (
                typeof array[0] ===
                "number"
            ) {

                points.push(array);

                return;

            }

            array.forEach(
                collect
            );

        }


        collect(coordinates);


        if (!points.length)
            return null;


        let lng = 0;
        let lat = 0;


        points.forEach(
            point => {

                lng += point[0];
                lat += point[1];

            }
        );


        return {

            lat:
                lat / points.length,

            lng:
                lng / points.length

        };

    } catch {

        return null;

    }
}


/* =========================================
   UPDATE SELECTED COUNTRY CLOCK
========================================= */

function updateSelectedCountry() {

    if (!selectedCountry)
        return;


    const timezone =
        countryTimezones[
            selectedCountry
        ];


    if (!timezone)
        return;


    const now =
        new Date();


    const time =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    timezone,

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hour12:
                    false
            }
        ).format(now);


    const date =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    timezone,

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(now);


    const offset =
        getUTCOffset(
            timezone
        );


    const hour =
        Number(
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        timezone,

                    hour:
                        "numeric",

                    hour12:
                        false
                }
            ).format(now)
        );


    let status;

    if (
        hour >= 6 &&
        hour < 18
    ) {

        status =
            "☀️ Daytime";

    } else {

        status =
            "🌙 Night";

    }


    document.getElementById(
        "country-time"
    ).textContent =
        time;


    document.getElementById(
        "country-date"
    ).textContent =
        date;


    document.getElementById(
        "country-zone"
    ).textContent =
        timezone;


    document.getElementById(
        "country-offset"
    ).textContent =
        offset;


    document.getElementById(
        "day-status"
    ).textContent =
        status;
}


/* =========================================
   UTC OFFSET
========================================= */

function getUTCOffset(
    timezone
) {

    const now =
        new Date();


    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    timezone,

                timeZoneName:
                    "longOffset"
            }
        ).formatToParts(now);


    const offset =
        parts.find(
            part =>
                part.type ===
                "timeZoneName"
        );


    return offset
        ? offset.value
        : "UTC";
}


/* =========================================
   QUICK WORLD CLOCKS
========================================= */

function updateQuickClock(
    timezone,
    element
) {

    const time =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    timezone,

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hour12:
                    false
            }
        ).format(
            new Date()
        );


    document.getElementById(
        element
    ).textContent =
        time;
}


function updateWorldClocks() {

    updateQuickClock(
        "Asia/Kolkata",
        "india-time"
    );

    updateQuickClock(
        "Europe/London",
        "london-time"
    );

    updateQuickClock(
        "America/New_York",
        "ny-time"
    );

    updateQuickClock(
        "Asia/Tokyo",
        "tokyo-time"
    );

    updateQuickClock(
        "Asia/Dubai",
        "dubai-time"
    );

    updateQuickClock(
        "Asia/Singapore",
        "singapore-time"
    );


    if (selectedCountry) {

        updateSelectedCountry();

    }

}


setInterval(
    updateWorldClocks,
    1000
);


/*
   Start
*/

loadWorldGlobe();

updateWorldClocks();

/* =========================
   SUBNET
========================= */

async function calculateSubnet() {

    const network =
        document.getElementById(
            "subnet-input"
        ).value;

    const output =
        document.getElementById(
            "subnet-result"
        );

    if (!network) {
        output.textContent =
            "Enter something like 192.168.1.0/24";
        return;
    }

    try {

        const response =
            await fetch(
                `/api/subnet?network=${encodeURIComponent(network)}`
            );

        const data =
            await response.json();

        if (data.error) {
            output.textContent =
                "❌ " + data.error;
            return;
        }

        output.textContent =
`Network:          ${data.network}
CIDR:             ${data.cidr}
Netmask:          ${data.netmask}
Broadcast:        ${data.broadcast}
First Host:       ${data.first_host}
Last Host:        ${data.last_host}
Total Addresses:  ${data.total_addresses}
Usable Hosts:     ${data.usable_hosts}
IP Version:       IPv${data.version}`;

    } catch {

        output.textContent =
            "Unable to calculate subnet.";

    }
}


/* =========================
   CLIENT INFO
========================= */

async function getClientInfo() {

    const output =
        document.getElementById(
            "client-result"
        );

    const response =
        await fetch("/api/client");

    const data =
        await response.json();

    output.textContent =
`IP Address:
${data.ip}

Host:
${data.host}

Method:
${data.method}

User Agent:
${data.user_agent}`;
}


/* =========================
   JSON
========================= */

function formatJSON() {

    const input =
        document.getElementById(
            "json-input"
        ).value;

    const output =
        document.getElementById(
            "json-result"
        );

    try {

        const parsed =
            JSON.parse(input);

        output.textContent =
            JSON.stringify(
                parsed,
                null,
                4
            );

    } catch (error) {

        output.textContent =
            "❌ Invalid JSON\n\n" +
            error.message;

    }
}


function minifyJSON() {

    const input =
        document.getElementById(
            "json-input"
        ).value;

    const output =
        document.getElementById(
            "json-result"
        );

    try {

        output.textContent =
            JSON.stringify(
                JSON.parse(input)
            );

    } catch {

        output.textContent =
            "❌ Invalid JSON";

    }
}


function clearJSON() {

    document.getElementById(
        "json-input"
    ).value = "";

    document.getElementById(
        "json-result"
    ).textContent = "";

}


/* =========================
   HASH
========================= */

async function generateHash() {

    const text =
        document.getElementById(
            "hash-input"
        ).value;

    const algorithm =
        document.getElementById(
            "hash-algorithm"
        ).value;

    const output =
        document.getElementById(
            "hash-result"
        );

    const response =
        await fetch(
            "/api/hash",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    text,
                    algorithm
                })
            }
        );

    const data =
        await response.json();

    output.textContent =
        data.hash || data.error;
}


/* =========================
   PASSWORD
========================= */

function generatePassword() {

    const length =
        Number(
            document.getElementById(
                "password-length"
            ).value
        );

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789" +
        "!@#$%^&*()_+-=[]{}";

    let password = "";

    const array =
        new Uint32Array(length);

    crypto.getRandomValues(array);

    for (
        let i = 0;
        i < length;
        i++
    ) {

        password +=
            chars[
                array[i] % chars.length
            ];

    }

    document.getElementById(
        "password-result"
    ).textContent =
        password;
}


/* =========================
   TIMESTAMP
========================= */

async function getTimestamp() {

    const response =
        await fetch(
            "/api/timestamp"
        );

    const data =
        await response.json();

    document.getElementById(
        "timestamp-result"
    ).textContent =
`Unix:
${data.unix}

UTC:
${data.utc}

ISO:
${data.iso}`;
}


/* =========================
   STOPWATCH
========================= */

let stopwatchStart = 0;

let stopwatchElapsed = 0;

let stopwatchInterval = null;


function formatStopwatch(ms) {

    const hours =
        Math.floor(ms / 3600000);

    const minutes =
        Math.floor(
            (ms % 3600000) / 60000
        );

    const seconds =
        Math.floor(
            (ms % 60000) / 1000
        );

    const millis =
        ms % 1000;

    return (
        String(hours).padStart(2, "0")
        + ":" +
        String(minutes).padStart(2, "0")
        + ":" +
        String(seconds).padStart(2, "0")
        + "." +
        String(millis).padStart(3, "0")
    );
}


function startStopwatch() {

    if (stopwatchInterval)
        return;

    stopwatchStart =
        Date.now() - stopwatchElapsed;

    stopwatchInterval =
        setInterval(() => {

            stopwatchElapsed =
                Date.now() -
                stopwatchStart;

            document.getElementById(
                "stopwatch-display"
            ).textContent =
                formatStopwatch(
                    stopwatchElapsed
                );

        }, 10);
}


function pauseStopwatch() {

    clearInterval(
        stopwatchInterval
    );

    stopwatchInterval = null;
}


function resetStopwatch() {

    pauseStopwatch();

    stopwatchElapsed = 0;

    document.getElementById(
        "stopwatch-display"
    ).textContent =
        "00:00:00.000";
}


/* =========================
   COUNTDOWN
========================= */

let timerRemaining = 0;

let timerInterval = null;


function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerRemaining / 60
        );

    const seconds =
        timerRemaining % 60;

    document.getElementById(
        "timer-display"
    ).textContent =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}


function startTimer() {

    if (timerInterval)
        return;

    if (timerRemaining <= 0) {

        const minutes =
            Number(
                document.getElementById(
                    "timer-minutes"
                ).value
            );

        const seconds =
            Number(
                document.getElementById(
                    "timer-seconds"
                ).value
            );

        timerRemaining =
            minutes * 60 + seconds;
    }

    if (timerRemaining <= 0)
        return;

    updateTimerDisplay();

    timerInterval =
        setInterval(() => {

            timerRemaining--;

            updateTimerDisplay();

            if (timerRemaining <= 0) {

                clearInterval(
                    timerInterval
                );

                timerInterval = null;

                alert(
                    "⏰ Timer finished!"
                );
            }

        }, 1000);
}


function pauseTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval = null;
}


function resetTimer() {

    pauseTimer();

    timerRemaining = 0;

    document.getElementById(
        "timer-display"
    ).textContent =
        "05:00";
}


/* =========================
   SYSTEM INFO
========================= */

async function loadSystemInfo() {

    const output =
        document.getElementById(
            "system-result"
        );

    try {

        const response =
            await fetch(
                "/api/system"
            );

        const data =
            await response.json();

        output.textContent =
`🐳 WORLD DESK SYSTEM

Hostname:
${data.hostname}

Platform:
${data.platform}

Version:
${data.platform_version}

Python:
${data.python}

Architecture:
${data.architecture}

Processor:
${data.processor || "Unknown"}

Process ID:
${data.pid}

Application Uptime:
${data.uptime_seconds} seconds`;

    } catch {

        output.textContent =
            "Unable to retrieve system information.";

    }
}


/* =========================
   NOTES
========================= */

const notesArea =
    document.getElementById(
        "notes-area"
    );


if (localStorage.getItem("worlddesk_notes")) {

    notesArea.value =
        localStorage.getItem(
            "worlddesk_notes"
        );
}


function saveNotes() {

    localStorage.setItem(
        "worlddesk_notes",
        notesArea.value
    );

    document.getElementById(
        "notes-status"
    ).textContent =
        "✓ Saved";

    setTimeout(() => {

        document.getElementById(
            "notes-status"
        ).textContent = "";

    }, 2000);
}


function clearNotes() {

    notesArea.value = "";

    localStorage.removeItem(
        "worlddesk_notes"
    );

    document.getElementById(
        "notes-status"
    ).textContent =
        "✓ Cleared";
}
