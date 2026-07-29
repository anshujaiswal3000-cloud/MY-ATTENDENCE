import sys, random
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient
from datetime import datetime

MONGODB_URI = "mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI)
col = client["attendx"]["userdatas"]
doc = col.find_one({})

def logid():
    return "log_" + hex(random.randint(0, 0xFFFFFF))[2:]

def make_ts(day, month, year, hour=9, minute=55):
    return int(datetime(year, month, day, hour, minute).timestamp() * 1000)

def log(sid, sname, day, month, year, hour=9, minute=55, inc=1):
    d = f"{str(day).zfill(2)}/{str(month).zfill(2)}/{year}"
    return {"id":logid(),"subjectId":sid,"subjectName":sname,"status":"present","increment":inc,"date":d,"timestamp":make_ts(day,month,year,hour,minute)}

# Target counts
# DLD=17, COA=12, DS=13, MATHS=13, PY=4, DSLAB=6, PSD=9, UHV=5, AI=4, ENG=4, QUANTS=3, LR=2, LIB=2

history = [
    # DLD — need 17 entries (Lab would be +2 each, but DLD is not lab so +1 each → need 17 logs)
    log("sub_dld","DIGITAL LOGIC DESIGN",14,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",16,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",18,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",21,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",23,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",25,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",28,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",14,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",16,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",18,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",21,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",23,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",25,7,2026,10,0),
    log("sub_dld","DIGITAL LOGIC DESIGN",28,7,2026,10,0),
    # 3 today (29 Jul) — COA sir absent, DLD took proxy
    log("sub_dld","DIGITAL LOGIC DESIGN",29,7,2026,9,50),
    log("sub_dld","DIGITAL LOGIC DESIGN",29,7,2026,10,40),
    log("sub_dld","DIGITAL LOGIC DESIGN",29,7,2026,11,30),

    # COA — need 12 entries
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",14,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",15,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",16,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",17,7,2026,9,50),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",18,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",21,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",22,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",23,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",24,7,2026,9,50),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",25,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",26,7,2026,10,40),
    log("sub_coa","COMPUTER ORGANIZATION & ARCHITECTURE",28,7,2026,10,40),
    # 29 Jul — COA sir absent, so NO log

    # DS — need 13 entries
    log("sub_ds","DATA STRUCTURE",14,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",15,7,2026,9,50),
    log("sub_ds","DATA STRUCTURE",16,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",17,7,2026,10,40),
    log("sub_ds","DATA STRUCTURE",18,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",21,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",22,7,2026,9,50),
    log("sub_ds","DATA STRUCTURE",23,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",24,7,2026,10,40),
    log("sub_ds","DATA STRUCTURE",25,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",26,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",28,7,2026,11,30),
    log("sub_ds","DATA STRUCTURE",29,7,2026,9,50),

    # MATHS — need 13 entries
    log("sub_maths","DISCRETE MATHEMATICS",14,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",15,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",16,7,2026,10,40),
    log("sub_maths","DISCRETE MATHEMATICS",17,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",18,7,2026,10,40),
    log("sub_maths","DISCRETE MATHEMATICS",19,7,2026,10,40),
    log("sub_maths","DISCRETE MATHEMATICS",21,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",22,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",23,7,2026,10,40),
    log("sub_maths","DISCRETE MATHEMATICS",24,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",25,7,2026,10,40),
    log("sub_maths","DISCRETE MATHEMATICS",26,7,2026,12,20),
    log("sub_maths","DISCRETE MATHEMATICS",28,7,2026,12,20),

    # PYTHON — need 4 entries (20,21,27,28 Jul)
    log("sub_py","PYTHON PROGRAMMING",20,7,2026,10,40),
    log("sub_py","PYTHON PROGRAMMING",21,7,2026,10,40),
    log("sub_py","PYTHON PROGRAMMING",27,7,2026,10,40),
    log("sub_py","PYTHON PROGRAMMING",29,7,2026,10,40),

    # DS LAB — need 6 total (+2 each = 3 lab sessions)
    log("sub_dslab","DATA STRUCTURES LAB",14,7,2026,10,40,2),
    log("sub_dslab","DATA STRUCTURES LAB",19,7,2026,10,40,2),
    log("sub_dslab","DATA STRUCTURES LAB",26,7,2026,10,40,2),

    # PSD — need 9 entries
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",14,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",15,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",16,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",17,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",21,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",22,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",23,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",24,7,2026,13,0),
    log("sub_psd","PERSONALITY & SKILL DEVELOPMENT",28,7,2026,13,0),

    # UHV — need 5 entries
    log("sub_uhv","UNIVERSAL HUMAN VALUES",15,7,2026,11,30),
    log("sub_uhv","UNIVERSAL HUMAN VALUES",16,7,2026,11,30),
    log("sub_uhv","UNIVERSAL HUMAN VALUES",22,7,2026,11,30),
    log("sub_uhv","UNIVERSAL HUMAN VALUES",23,7,2026,11,30),
    log("sub_uhv","UNIVERSAL HUMAN VALUES",29,7,2026,11,30),

    # AI — need 4 entries
    log("sub_ai","SKILL - AI",15,7,2026,12,20),
    log("sub_ai","SKILL - AI",16,7,2026,11,30),
    log("sub_ai","SKILL - AI",22,7,2026,12,20),
    log("sub_ai","SKILL - AI",23,7,2026,11,30),

    # ENG HARD SKILL — need 4 entries
    log("sub_eng","ENG HARD SKILL",17,7,2026,11,30),
    log("sub_eng","ENG HARD SKILL",18,7,2026,11,30),
    log("sub_eng","ENG HARD SKILL",24,7,2026,11,30),
    log("sub_eng","ENG HARD SKILL",25,7,2026,11,30),

    # QUANTS — need 3 entries
    log("sub_quants","QUANTS",17,7,2026,12,20),
    log("sub_quants","QUANTS",18,7,2026,12,20),
    log("sub_quants","QUANTS",25,7,2026,12,20),

    # LOGICAL REASONING — need 2 entries
    log("sub_lr","LOGICAL REASONING",19,7,2026,11,30),
    log("sub_lr","LOGICAL REASONING",26,7,2026,11,30),

    # LIBRARY — need 2 entries
    log("sub_lib","LIBRARY",14,7,2026,12,55),
    log("sub_lib","LIBRARY",25,7,2026,12,55),
]

# Sort latest first
history.sort(key=lambda x: x["timestamp"], reverse=True)

# ── VERIFY ALL COUNTS ──
count_check = {}
for entry in history:
    sid = entry["subjectId"]
    count_check[sid] = count_check.get(sid, 0) + entry.get("increment", 1)

expected = {
    "sub_dld":17, "sub_coa":12, "sub_ds":13, "sub_maths":13,
    "sub_py":4, "sub_dslab":6, "sub_psd":9, "sub_uhv":5,
    "sub_ai":4, "sub_eng":4, "sub_quants":3, "sub_lr":2, "sub_lib":2
}

all_ok = True
for sid, exp in expected.items():
    got = count_check.get(sid, 0)
    ok = "OK" if got == exp else f"MISMATCH expected={exp}, got={got}"
    print(f"  {sid:20s} {ok}")
    if got != exp:
        all_ok = False

print()
if all_ok:
    print(f"All {len(history)} logs verified! Pushing to MongoDB Atlas...")
    col.update_one({"_id": doc["_id"]}, {"$set": {"history": history}})
    print("Done! Cloud updated successfully.")
else:
    print("Counts mismatch — NOT pushed. Fix above errors.")
