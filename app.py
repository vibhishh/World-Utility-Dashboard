from flask import Flask, render_template, jsonify
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

app = Flask(__name__)


# -----------------------------
# Country -> Timezone database
# -----------------------------

COUNTRIES = {
    "India": "Asia/Kolkata",
    "United States": "America/New_York",
    "United Kingdom": "Europe/London",
    "Canada": "America/Toronto",
    "Australia": "Australia/Sydney",
    "Japan": "Asia/Tokyo",
    "China": "Asia/Shanghai",
    "Singapore": "Asia/Singapore",
    "UAE": "Asia/Dubai",
    "Saudi Arabia": "Asia/Riyadh",
    "Germany": "Europe/Berlin",
    "France": "Europe/Paris",
    "Brazil": "America/Sao_Paulo",
    "Mexico": "America/Mexico_City",
    "South Africa": "Africa/Johannesburg",
    "Russia": "Europe/Moscow",
    "South Korea": "Asia/Seoul",
    "Thailand": "Asia/Bangkok",
    "Nepal": "Asia/Kathmandu",
    "Indonesia": "Asia/Jakarta",
    "New Zealand": "Pacific/Auckland",
}


@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Health Check
# -----------------------------

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "application": "Flask World Dashboard",
        "timestamp": datetime.utcnow().isoformat()
    })


# -----------------------------
# Current server time
# -----------------------------

@app.route("/api/time")
def current_time():

    now = datetime.now(ZoneInfo("Asia/Kolkata"))

    return jsonify({
        "time": now.strftime("%H:%M:%S"),
        "date": now.strftime("%A, %d %B %Y"),
        "timezone": "Asia/Kolkata"
    })


# -----------------------------
# Country time
# -----------------------------

@app.route("/api/country/<path:country>")
def country_time(country):

    timezone = COUNTRIES.get(country)

    if not timezone:
        return jsonify({
            "error": "Country not configured"
        }), 404

    try:
        now = datetime.now(ZoneInfo(timezone))

        return jsonify({
            "country": country,
            "timezone": timezone,
            "time": now.strftime("%H:%M:%S"),
            "date": now.strftime("%A, %d %B %Y"),
            "utc_offset": now.strftime("%z")
        })

    except ZoneInfoNotFoundError:

        return jsonify({
            "error": "Timezone unavailable"
        }), 500


# -----------------------------
# Country list
# -----------------------------

@app.route("/api/countries")
def countries():

    return jsonify(COUNTRIES)


# -----------------------------
# Timezone converter
# -----------------------------

@app.route("/api/convert")
def convert_time():

    from flask import request

    source = request.args.get("source")
    target = request.args.get("target")

    if not source or not target:
        return jsonify({
            "error": "source and target are required"
        }), 400

    try:

        source_time = datetime.now(
            ZoneInfo(source)
        )

        target_time = source_time.astimezone(
            ZoneInfo(target)
        )

        return jsonify({
            "source": source,
            "target": target,
            "source_time": source_time.strftime("%H:%M:%S"),
            "target_time": target_time.strftime("%H:%M:%S"),
            "target_date": target_time.strftime("%A, %d %B %Y")
        })

    except ZoneInfoNotFoundError:

        return jsonify({
            "error": "Invalid timezone"
        }), 400


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
