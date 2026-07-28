import asyncio
import datetime
import json
import re

print("⚡ [PYTHON AUTO-ATTENDANCE ENGINE] Sub-Second Fast Engine Started for Target: +91 9125469499")

def get_ist_time():
    # Return current time in IST (UTC+5:30)
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    ist_now = utc_now + datetime.timedelta(hours=5, minutes=30)
    return ist_now

async def run_subsecond_scheduler():
    target_phone = "919125469499"
    print(f"🚀 [PYTHON ENGINE] Active & Monitoring IST Time: {get_ist_time().strftime('%Y-%m-%d %H:%M:%S')} IST")

    while True:
        try:
            now = get_ist_time()
            # Sub-second fast loop sleeping for 1 second
            await asyncio.sleep(1)
        except Exception as e:
            print(f"❌ [PYTHON ENGINE ERROR]: {e}")
            await asyncio.sleep(5)

if __name__ == '__main__':
    asyncio.run(run_subsecond_scheduler())
