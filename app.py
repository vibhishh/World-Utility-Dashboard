from flask import Flask, render_template, jsonify, request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import hashlib
import ipaddress
import os
import platform
import socket
import time


app = Flask(__name__)

START_TIME = time.time()


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


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "application": "WorldDesk",
        "uptime": round(time.time() - START_TIME, 2)
    })


@app.route("/api/time")
def api_time():

    now = datetime.now(
        ZoneInfo("Asia/Kolkata")
    )

    return jsonify({
        "time": now.strftime("%H:%M:%S"),
        "date": now.strftime("%A, %d %B %Y"),
        "timezone": "Asia/Kolkata"
    })


@app.route("/api/countries")
def countries():
    return jsonify(COUNTRIES)


@app.route("/api/country/<path:country>")
def country_time(country):

    timezone_name = COUNTRIES.get(country)

    if not timezone_name:
        return jsonify({
            "error": "Country not configured"
        }), 404

    try:

        now = datetime.now(
            ZoneInfo(timezone_name)
        )

        return jsonify({
            "country": country,
            "timezone": timezone_name,
            "time": now.strftime("%H:%M:%S"),
            "date": now.strftime("%A, %d %B %Y"),
            "utc_offset": now.strftime("%z")
        })

    except ZoneInfoNotFoundError:

        return jsonify({
            "error": "Timezone unavailable"
        }), 500


@app.route("/api/convert")
def convert_time():

    source = request.args.get("source")
    target = request.args.get("target")

    if not source or not target:
        return jsonify({
            "error": "source and target required"
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
            "source_time": source_time.strftime(
                "%H:%M:%S"
            ),
            "target_time": target_time.strftime(
                "%H:%M:%S"
            ),
            "target_date": target_time.strftime(
                "%A, %d %B %Y"
            )
        })

    except ZoneInfoNotFoundError:

        return jsonify({
            "error": "Invalid timezone"
        }), 400


# -----------------------------
# IP / SUBNET CALCULATOR
# -----------------------------

@app.route("/api/subnet")
def subnet():

    network_input = request.args.get("network")

    if not network_input:
        return jsonify({
            "error": "Network is required"
        }), 400

    try:

        network = ipaddress.ip_network(
            network_input,
            strict=False
        )

        hosts = list(network.hosts())

        return jsonify({
            "network": str(network.network_address),
            "netmask": str(network.netmask),
            "cidr": str(network),
            "broadcast": str(network.broadcast_address),
            "first_host": str(hosts[0]) if hosts else "N/A",
            "last_host": str(hosts[-1]) if hosts else "N/A",
            "total_addresses": network.num_addresses,
            "usable_hosts": max(
                network.num_addresses - 2,
                0
            ),
            "version": network.version
        })

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400


# -----------------------------
# HASH GENERATOR
# -----------------------------

@app.route("/api/hash", methods=["POST"])
def generate_hash():

    data = request.get_json()

    text = data.get("text", "")

    algorithm = data.get(
        "algorithm",
        "sha256"
    ).lower()

    algorithms = {
        "md5": hashlib.md5,
        "sha1": hashlib.sha1,
        "sha256": hashlib.sha256,
        "sha512": hashlib.sha512
    }

    if algorithm not in algorithms:
        return jsonify({
            "error": "Unsupported algorithm"
        }), 400

    result = algorithms[algorithm](
        text.encode()
    ).hexdigest()

    return jsonify({
        "algorithm": algorithm,
        "hash": result
    })


# -----------------------------
# SYSTEM INFORMATION
# -----------------------------

@app.route("/api/system")
def system_info():

    uptime = time.time() - START_TIME

    return jsonify({
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "platform_version": platform.release(),
        "python": platform.python_version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "pid": os.getpid(),
        "uptime_seconds": round(uptime, 2)
    })


# -----------------------------
# CLIENT INFORMATION
# -----------------------------

@app.route("/api/client")
def client_info():

    return jsonify({
        "ip": request.remote_addr,
        "user_agent": request.headers.get(
            "User-Agent"
        ),
        "method": request.method,
        "host": request.host
    })


# -----------------------------
# TIMESTAMP
# -----------------------------

@app.route("/api/timestamp")
def timestamp():

    now = datetime.now(timezone.utc)

    return jsonify({
        "unix": int(now.timestamp()),
        "utc": now.strftime(
            "%Y-%m-%d %H:%M:%S UTC"
        ),
        "iso": now.isoformat()
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=9000,
        debug=False
    )
