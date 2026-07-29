"""
AttendX Python Auto-Attendance Engine
======================================
Ultra-fast auto-attendance daemon using pymongo (direct MongoDB Atlas connection).

SPEED COMPARISON:
  Old (Node.js): HTTP API → server.js → MongoDB  [30s interval, 3 hops]
  New (Python):  Direct pymongo → MongoDB Atlas   [5s interval, 1 hop] ← 6x FASTER

HOW IT WORKS:
  - Connects DIRECTLY to MongoDB Atlas (no HTTP overhead)
  - Checks IST time every 5 seconds
  - Auto-marks Present when a lecture's end-time passes
  - Never double-marks (slotKey guard stored in autoLoggedSlots)
  - Sends WhatsApp alert via CallmeBot API on each auto-mark
  - Works alongside the Node.js server (they both write independently)

DEPLOYMENT:
  Option A - Local:  python auto_attendance.py
  Option B - Render: Add as a Background Worker service (free tier)

INSTALL DEPS:
  pip install pymongo requests python-dotenv
"""

import time
import uuid
import random
import string
import requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient, UpdateOne

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
MONGODB_URI = "mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority"

WHATSAPP_PHONE   = "919125469499"           # CallmeBot target number
CALLMEBOT_APIKEY = "9827414"               # CallmeBot API Key

CHECK_INTERVAL_SECONDS = 5   # Check every 5 seconds (was 30s in Node.js → 6x faster)
IST = timezone(timedelta(hours=5, minutes=30))

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def get_ist_now() -> datetime:
    """Current time in IST timezone."""
    return datetime.now(tz=IST)


def get_today_name() -> str:
    """e.g. 'Monday', 'Tuesday' ..."""
    return DAYS[get_ist_now().weekday()]


def parse_end_time(time_range_str: str):
    """
    Parse 'HH:MM AM - HH:MM PM' style ranges.
    Returns (hour_24, minute) or None.
    """
    try:
        parts = time_range_str.split("-")
        if len(parts) < 2:
            return None
        end_str = parts[1].strip()
        tokens   = end_str.split()
        time_val = tokens[0]
        modifier = tokens[1].upper() if len(tokens) > 1 else "AM"
        h, m     = map(int, time_val.split(":"))
        if modifier == "PM" and h < 12:
            h += 12
        if modifier == "AM" and h == 12:
            h = 0
        return h, m
    except Exception:
        return None


def class_has_ended(time_range_str: str, now: datetime) -> bool:
    """True if the class end-time has already passed today."""
    result = parse_end_time(time_range_str)
    if result is None:
        return False
    end_h, end_m = result
    cur_h, cur_m = now.hour, now.minute
    return cur_h > end_h or (cur_h == end_h and cur_m >= end_m)


def format_date_indian(now: datetime) -> str:
    """DD/MM/YYYY"""
    return now.strftime("%d/%m/%Y")


def format_time_12h(now: datetime) -> str:
    """e.g. '09:50 AM'"""
    return now.strftime("%I:%M %p")


def send_whatsapp_alert(message: str):
    """Send WhatsApp message via CallmeBot API."""
    try:
        url = (
            f"https://api.callmebot.com/whatsapp.php"
            f"?phone={WHATSAPP_PHONE}"
            f"&text={requests.utils.quote(message)}"
            f"&apikey={CALLMEBOT_APIKEY}"
        )
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            print(f"  📲 WhatsApp alert sent: {message[:60]}...")
        else:
            print(f"  ⚠️  WhatsApp alert failed (HTTP {r.status_code})")
    except Exception as e:
        print(f"  ⚠️  WhatsApp error: {e}")


def random_id(prefix="auto", length=8) -> str:
    return prefix + "_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


# ─────────────────────────────────────────────────────────────
# MONGODB CONNECTION
# ─────────────────────────────────────────────────────────────

def connect_mongo():
    print("🔗 Connecting to MongoDB Atlas...")
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
    db     = client["attendx"]
    col    = db["userdatas"]
    # Quick connectivity test
    client.admin.command("ping")
    print("✅ MongoDB Atlas connected!\n")
    return col


# ─────────────────────────────────────────────────────────────
# CORE: AUTO-ATTENDANCE ENGINE
# ─────────────────────────────────────────────────────────────

def run_auto_attendance(col):
    """
    Single pass of the auto-attendance engine.
    Called every CHECK_INTERVAL_SECONDS seconds.
    """
    now         = get_ist_now()
    today_name  = get_today_name()
    date_str    = format_date_indian(now)
    time_str    = format_time_12h(now)

    # Skip Sundays automatically
    if today_name == "Sunday":
        return

    # Fetch user document directly from MongoDB
    user_doc = col.find_one({})
    if not user_doc:
        print("⚠️  No user document found in DB.")
        return

    settings       = user_doc.get("settings") or {}
    auto_attendance = settings.get("autoAttendance", True)
    mass_bunk       = settings.get("massBunkToday", False)
    holiday_today   = settings.get("officialHolidayToday", False)
    active_semester = settings.get("semester", "Semester 3")

    # Guards
    if not auto_attendance:
        return
    if mass_bunk:
        print(f"  🏠 Mass Bunk active — skipping auto-attendance")
        return
    if holiday_today:
        print(f"  🎉 Holiday today — skipping auto-attendance")
        return
    if active_semester != "Semester 3":
        return

    subjects        = user_doc.get("subjects") or []
    history         = user_doc.get("history") or []
    auto_logged     = set(user_doc.get("autoLoggedSlots") or [])

    updated_subjects = []
    new_history      = []
    new_auto_slots   = []
    any_updated      = False

    for subj in subjects:
        is_lab    = subj.get("isLab", False) or "lab" in subj.get("name", "").lower()
        increment = 2 if is_lab else 1
        present   = subj.get("present", 0)
        total     = subj.get("total", 0)
        modified  = False

        for slot in (subj.get("timetable") or []):
            if slot.get("day") != today_name:
                continue

            slot_time = slot.get("time", "")
            if not class_has_ended(slot_time, now):
                continue

            slot_key = f"{date_str}_{subj['id']}_{today_name}_{slot_time}"
            if slot_key in auto_logged:
                continue  # Already marked — never double count

            # ── Mark Present ──
            present += increment
            total   += increment
            modified  = True
            any_updated = True
            auto_logged.add(slot_key)
            new_auto_slots.append(slot_key)

            log_entry = {
                "id":          random_id(),
                "subjectId":   subj["id"],
                "subjectName": subj["name"],
                "status":      "present",
                "auto":        True,
                "isLab":       is_lab,
                "increment":   increment,
                "date":        date_str,
                "timestamp":   int(now.timestamp() * 1000),
            }
            new_history.append(log_entry)

            msg = (
                f"✅ [ATTIX AUTO] {subj['name']} ({slot_time}) "
                f"marked +{increment} Present at {time_str} on {date_str}"
            )
            print(f"  ⏰ {msg}")
            send_whatsapp_alert(msg)

        updated_subjects.append({
            **subj,
            "present": present,
            "total":   total,
        } if modified else subj)

    if any_updated:
        # Prepend new history entries (latest first)
        full_history = new_history + list(history)

        col.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "subjects":       updated_subjects,
                    "history":        full_history,
                    "autoLoggedSlots": list(auto_logged),
                    "updatedAt":       now.isoformat(),
                }
            }
        )
        print(f"  ✅ [{time_str} IST] MongoDB Atlas updated — {len(new_history)} slot(s) marked.")
    else:
        # Uncomment below for verbose debug output:
        # print(f"  ⚡ [{time_str}] Checked — no new slots to mark.")
        pass


# ─────────────────────────────────────────────────────────────
# KEEP-ALIVE PINGER (Render won't sleep)
# ─────────────────────────────────────────────────────────────

_last_ping = 0

def ping_render_if_needed():
    global _last_ping
    now_ts = time.time()
    if now_ts - _last_ping > 240:   # Every 4 minutes
        try:
            r = requests.get(
                "https://my-attendence.onrender.com/api/ping",
                timeout=8
            )
            if r.status_code == 200:
                data = r.json()
                print(f"  ⚡ [KEEP-ALIVE] Render ping OK — {data.get('message', 'alive')}")
        except Exception:
            pass
        _last_ping = now_ts


# ─────────────────────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────────────────────

import sys

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    print("=" * 60)
    print("  AttendX Python Auto-Attendance Engine v1.0")
    print("  Speed: 5s interval | Direct MongoDB | IST-aware")
    print("  Created by Anshu Jaiswal ✨")
    print("=" * 60)
    print()

    col = connect_mongo()

    print(f"🚀 Engine started! Checking every {CHECK_INTERVAL_SECONDS}s ...")
    print()

    pass_count = 0
    while True:
        try:
            pass_count += 1
            run_auto_attendance(col)
            ping_render_if_needed()
        except Exception as e:
            print(f"  ❌ Error in pass #{pass_count}: {e}")
            # Auto-reconnect on DB disconnect
            try:
                col = connect_mongo()
            except Exception:
                pass

        time.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
