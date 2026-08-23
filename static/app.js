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
        setTimeout(() => map.invalidateSize(), 200);
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


/* =========================
   WORLD MAP
========================= */

const map =
    L.map("map")
        .setView([20, 0], 2);


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


const locations = {

    India: [20.5937, 78.9629],

    "United States": [37.0902, -95.7129],

    "United Kingdom": [55.3781, -3.4360],

    Canada: [56.1304, -106.3468],

    Australia: [-25.2744, 133.7751],

    Japan: [36.2048, 138.2529],

    China: [35.8617, 104.1954],

    Singapore: [1.3521, 103.8198],

    UAE: [23.4241, 53.8478],

    Germany: [51.1657, 10.4515],

    France: [46.2276, 2.2137],

    Brazil: [-14.235, -51.9253],

    Mexico: [23.6345, -102.5528],

    "South Africa": [-30.5595, 22.9375],

    Russia: [61.5240, 105.3188],

    "South Korea": [35.9078, 127.7669],

    Thailand: [15.87, 100.9925],

    Nepal: [28.3949, 84.1240],

    Indonesia: [-0.7893, 113.9213],

    "New Zealand": [-40.9006, 174.8860]

};


let selectedCountry = null;


Object.entries(locations)
    .forEach(([country, coordinates]) => {

        const marker =
            L.marker(coordinates)
                .addTo(map);

        marker.bindTooltip(country);

        marker.on("click", () => {

            selectedCountry = country;

            loadCountry(country);

        });

    });


async function loadCountry(country) {

    try {

        const response =
            await fetch(
                `/api/country/${encodeURIComponent(country)}`
            );

        const data =
            await response.json();

        document.getElementById(
            "country-name"
        ).textContent =
            data.country;

        document.getElementById(
            "country-time"
        ).textContent =
            data.time;

        document.getElementById(
            "country-date"
        ).textContent =
            data.date;

        document.getElementById(
            "country-zone"
        ).textContent =
            `${data.timezone} • UTC ${formatUTC(data.utc_offset)}`;

    } catch (error) {

        console.error(error);

    }
}


function formatUTC(value) {

    if (!value) return "--";

    const sign =
        value.startsWith("-")
            ? "-"
            : "+";

    return `${sign}${value.substring(1,3)}:${value.substring(3,5)}`;
}


/* Quick clocks */

async function quickClock(
    country,
    element
) {

    try {

        const response =
            await fetch(
                `/api/country/${encodeURIComponent(country)}`
            );

        const data =
            await response.json();

        document.getElementById(element)
            .textContent =
            data.time;

    } catch {

        document.getElementById(element)
            .textContent =
            "--:--:--";

    }
}


function updateWorldClocks() {

    quickClock(
        "India",
        "india-time"
    );

    quickClock(
        "United Kingdom",
        "london-time"
    );

    quickClock(
        "United States",
        "ny-time"
    );

    quickClock(
        "Japan",
        "tokyo-time"
    );

    if (selectedCountry) {
        loadCountry(selectedCountry);
    }
}

setInterval(
    updateWorldClocks,
    1000
);

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
