/* =====================================
   NAVIGATION
===================================== */

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });


    document
        .getElementById(sectionId)
        .classList.add("active");


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {
            button.classList.remove("active");
        });


    const titles = {

        dashboard: "Dashboard",

        "world-clock": "World Clock",

        calculator: "Calculator",

        stopwatch: "Stopwatch",

        timer: "Countdown Timer",

        converter: "Timezone Converter"

    };


    document.getElementById("page-title")
        .textContent = titles[sectionId] || "Dashboard";


    if (sectionId === "world-clock") {

        setTimeout(() => {

            map.invalidateSize();

        }, 200);

    }

}


/* =====================================
   MAIN CLOCK
===================================== */

function updateMainClock() {

    const now = new Date();


    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour12: false
            }
        );


    const date =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "main-clock"
    ).textContent = time;


    document.getElementById(
        "main-date"
    ).textContent = date;

}


setInterval(updateMainClock, 1000);

updateMainClock();


/* =====================================
   HEALTH CHECK
===================================== */

async function checkHealth() {

    const result =
        document.getElementById(
            "health-result"
        );


    result.textContent =
        "Checking API...";


    try {

        const response =
            await fetch("/health");


        const data =
            await response.json();


        result.textContent =
            `✓ ${data.status.toUpperCase()} — Flask API is working`;

    }

    catch (error) {

        result.textContent =
            "✕ API unavailable";

    }

}


/* =====================================
   CALCULATOR
===================================== */

let calcExpression = "";


function appendCalc(value) {

    if (
        calcExpression === "Error"
    ) {
        calcExpression = "";
    }


    calcExpression += value;

    updateCalcDisplay();

}


function updateCalcDisplay() {

    document.getElementById(
        "calc-display"
    ).value =
        calcExpression || "0";

}


function clearCalc() {

    calcExpression = "";

    updateCalcDisplay();

}


function deleteCalc() {

    calcExpression =
        calcExpression.slice(0, -1);

    updateCalcDisplay();

}


function squareCalc() {

    try {

        const value =
            Function(
                `"use strict"; return (${calcExpression})`
            )();

        calcExpression =
            String(value * value);

        updateCalcDisplay();

    }

    catch {

        calcExpression = "Error";

        updateCalcDisplay();

    }

}


function calculate() {

    try {

        let expression =
            calcExpression.replace(
                /%/g,
                "/100"
            );


        const result =
            Function(
                `"use strict"; return (${expression})`
            )();


        if (!Number.isFinite(result)) {

            throw new Error();

        }


        calcExpression =
            String(result);


        updateCalcDisplay();

    }

    catch {

        calcExpression = "Error";

        updateCalcDisplay();

    }

}


/* Keyboard support */

document.addEventListener(
    "keydown",
    event => {

        const allowed =
            "0123456789+-*/().%";


        if (
            allowed.includes(
                event.key
            )
        ) {

            appendCalc(event.key);

        }


        if (
            event.key === "Enter"
        ) {

            calculate();

        }


        if (
            event.key === "Backspace"
        ) {

            deleteCalc();

        }


        if (
            event.key === "Escape"
        ) {

            clearCalc();

        }

    }
);


/* =====================================
   STOPWATCH
===================================== */

let stopwatchStart = 0;

let stopwatchElapsed = 0;

let stopwatchInterval = null;


function formatStopwatch(milliseconds) {

    const ms =
        milliseconds % 1000;

    const totalSeconds =
        Math.floor(
            milliseconds / 1000
        );

    const seconds =
        totalSeconds % 60;

    const minutes =
        Math.floor(
            totalSeconds / 60
        ) % 60;

    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    return (
        String(hours).padStart(2, "0")
        + ":" +
        String(minutes).padStart(2, "0")
        + ":" +
        String(seconds).padStart(2, "0")
        + "." +
        String(ms).padStart(3, "0")
    );

}


function updateStopwatch() {

    stopwatchElapsed =
        Date.now() - stopwatchStart;


    document.getElementById(
        "stopwatch-display"
    ).textContent =
        formatStopwatch(
            stopwatchElapsed
        );

}


function startStopwatch() {

    if (stopwatchInterval) {
        return;
    }


    stopwatchStart =
        Date.now() - stopwatchElapsed;


    stopwatchInterval =
        setInterval(
            updateStopwatch,
            10
        );

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


/* =====================================
   COUNTDOWN TIMER
===================================== */

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

        String(minutes).padStart(2, "0")
        + ":" +
        String(seconds).padStart(2, "0");

}


function startTimer() {

    if (timerInterval) {
        return;
    }


    if (
        timerRemaining <= 0
    ) {

        const minutes =
            parseInt(
                document.getElementById(
                    "timer-minutes"
                ).value
            ) || 0;


        const seconds =
            parseInt(
                document.getElementById(
                    "timer-seconds"
                ).value
            ) || 0;


        timerRemaining =
            minutes * 60 + seconds;

    }


    if (timerRemaining <= 0) {
        return;
    }


    updateTimerDisplay();


    timerInterval =
        setInterval(() => {

            timerRemaining--;

            updateTimerDisplay();


            if (
                timerRemaining <= 0
            ) {

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
    ).textContent = "05:00";

}


/* =====================================
   WORLD MAP
===================================== */

const map =
    L.map("map").setView(
        [20, 0],
        2
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/*
    Country coordinates.

    These are connected to the Flask
    timezone API.
*/

const countryLocations = {

    India: [20.5937, 78.9629],

    "United States": [37.0902, -95.7129],

    "United Kingdom": [55.3781, -3.4360],

    Canada: [56.1304, -106.3468],

    Australia: [-25.2744, 133.7751],

    Japan: [36.2048, 138.2529],

    China: [35.8617, 104.1954],

    Singapore: [1.3521, 103.8198],

    UAE: [23.4241, 53.8478],

    "Saudi Arabia": [23.8859, 45.0792],

    Germany: [51.1657, 10.4515],

    France: [46.2276, 2.2137],

    Brazil: [-14.235, -51.9253],

    Mexico: [23.6345, -102.5528],

    "South Africa": [-30.5595, 22.9375],

    Russia: [61.5240, 105.3188],

    "South Korea": [35.9078, 127.7669],

    Thailand: [15.8700, 100.9925],

    Nepal: [28.3949, 84.1240],

    Indonesia: [-0.7893, 113.9213],

    "New Zealand": [-40.9006, 174.8860]

};


Object.entries(
    countryLocations
).forEach(
    ([country, coordinates]) => {

        const marker =
            L.marker(
                coordinates
            ).addTo(map);


        marker.on(
            "click",
            () => {

                loadCountry(
                    country
                );

            }
        );


        marker.bindTooltip(
            country
        );

    }
);


/* =====================================
   COUNTRY CLOCK
===================================== */

let selectedCountry = null;


async function loadCountry(country) {

    selectedCountry = country;


    try {

        const response =
            await fetch(
                `/api/country/${encodeURIComponent(country)}`
            );


        const data =
            await response.json();


        if (data.error) {

            return;

        }


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

    }

    catch (error) {

        console.error(error);

    }

}


function formatUTC(offset) {

    if (!offset) {
        return "--";
    }


    const sign =
        offset.startsWith("-")
            ? "-"
            : "+";


    const hours =
        offset.slice(1, 3);


    const minutes =
        offset.slice(3, 5);


    return `${sign}${hours}:${minutes}`;

}


/* Update selected country every second */

setInterval(() => {

    if (selectedCountry) {

        loadCountry(
            selectedCountry
        );

    }

}, 1000);


/* =====================================
   QUICK WORLD CLOCKS
===================================== */

async function updateWorldClock(
    country,
    elementId
) {

    try {

        const response =
            await fetch(
                `/api/country/${encodeURIComponent(country)}`
            );


        const data =
            await response.json();


        document.getElementById(
            elementId
        ).textContent =
            data.time;

    }

    catch {

        document.getElementById(
            elementId
        ).textContent =
            "--:--:--";

    }

}


function updateQuickClocks() {

    updateWorldClock(
        "India",
        "india-time"
    );


    updateWorldClock(
        "United Kingdom",
        "london-time"
    );


    updateWorldClock(
        "Japan",
        "tokyo-time"
    );


    updateWorldClock(
        "United States",
        "ny-time"
    );

}


updateQuickClocks();


setInterval(
    updateQuickClocks,
    1000
);


/* =====================================
   TIMEZONE CONVERTER
===================================== */

async function convertTime() {

    const source =
        document.getElementById(
            "source-zone"
        ).value;


    const target =
        document.getElementById(
            "target-zone"
        ).value;


    const result =
        document.getElementById(
            "conversion-result"
        );


    result.textContent =
        "Converting...";


    try {

        const response =
            await fetch(
                `/api/convert?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`
            );


        const data =
            await response.json();


        if (data.error) {

            result.textContent =
                data.error;

            return;

        }


        result.innerHTML = `

            <strong>
                ${data.source_time}
            </strong>

            &nbsp; → &nbsp;

            <strong>
                ${data.target_time}
            </strong>

            <br>

            <small>
                ${data.target_date}
            </small>

        `;

    }

    catch {

        result.textContent =
            "Conversion failed.";

    }

}


/* =====================================
   INITIAL LOAD
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateMainClock();

        updateQuickClocks();

        updateCalcDisplay();

    }
);
