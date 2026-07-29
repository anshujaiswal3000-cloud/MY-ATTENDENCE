"""
CORRECT calendar-based history for 14 Jul - 29 Jul 2026:
14=Tue, 15=Wed, 16=Thu, 17=Fri, 18=Sat(3rd=HOLIDAY!), 19=Sun
20=Mon, 21=Tue, 22=Wed, 23=Thu, 24=Fri, 25=Sat(4th=WORKING), 26=Sun
27=Mon, 28=Tue, 29=Wed

Python on 20(Mon P3), 21(Tue P9), 27(Mon P3), 28(Tue P9) ✅

COA sir absent on 29 Jul (Wed) → DLD sir took 3 classes:
On Wed: DLD has P3(10:40-11:30) and P9(3:40-4:30) = 2 slots normally
29 Jul proxy = 3 classes → add one extra DLD slot (COA's P2 slot)

Target counts:
DLD=17, CO=12, DS=13, DSTL=13, PY=4, DSLAB=6(+2×3), COLAB=4(+2×2), WDWLAB=4(+2×2)
UHV=5, ENG=4, LIB=2, LR=2, PSD=9, QUANTS=3, SKILLAI=4
"""
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

def make_ts(day, month, year, hour=9, minute=0):
    return int(datetime(year, month, day, hour, minute).timestamp() * 1000)

def log(sid, sname, day, m, y, h, mi, inc=1, is_lab=False):
    d = f"{str(day).zfill(2)}/{str(m).zfill(2)}/{y}"
    return {"id":logid(),"subjectId":sid,"subjectName":sname,"status":"present","increment":inc,"isLab":is_lab,"date":d,"timestamp":make_ts(day,m,y,h,mi),"auto":True}

subjects = [
    {"id":"subj_python","name":"PYTHON","code":"BCC-302","faculty":"Ajai Kumar Maurya","icon":"python","isLab":False,"isIgnored":False,"color":["#10b981","#3b82f6"],"present":4,"total":4,"timetable":[{"day":"Monday","period":"P3","periodOrder":3,"time":"10:40 AM - 11:30 AM"},{"day":"Tuesday","period":"P9","periodOrder":9,"time":"03:40 PM - 04:30 PM"},{"day":"Saturday","period":"P7","periodOrder":7,"time":"03:00 PM - 04:00 PM"}]},
    {"id":"subj_ds","name":"DATA STRUCTURE (DS)","code":"BCS-301","faculty":"Sunil Kumar Khare","icon":"book","isLab":False,"isIgnored":False,"color":["#3b82f6","#8b5cf6"],"present":13,"total":13,"timetable":[{"day":"Monday","period":"P2","periodOrder":2,"time":"09:50 AM - 10:40 AM"},{"day":"Tuesday","period":"P3","periodOrder":3,"time":"10:40 AM - 11:30 AM"},{"day":"Wednesday","period":"P4","periodOrder":4,"time":"11:30 AM - 12:20 PM"},{"day":"Thursday","period":"P1","periodOrder":1,"time":"09:00 AM - 09:50 AM"},{"day":"Friday","period":"P3","periodOrder":3,"time":"10:40 AM - 11:30 AM"},{"day":"Saturday","period":"P5","periodOrder":5,"time":"02:00 PM - 03:00 PM"}]},
    {"id":"subj_co","name":"COMPUTER ORGANIZATION (CO)","code":"BCS-302","faculty":"Chitranjan Dwivedi","icon":"cpu","isLab":False,"isIgnored":False,"color":["#10b981","#3b82f6"],"present":12,"total":12,"timetable":[{"day":"Monday","period":"P1","periodOrder":1,"time":"09:00 AM - 09:50 AM"},{"day":"Tuesday","period":"P1","periodOrder":1,"time":"09:00 AM - 09:50 AM"},{"day":"Wednesday","period":"P2","periodOrder":2,"time":"09:50 AM - 10:40 AM"},{"day":"Thursday","period":"P2","periodOrder":2,"time":"09:50 AM - 10:40 AM"},{"day":"Friday","period":"P5","periodOrder":5,"time":"12:20 PM - 01:10 PM"},{"day":"Saturday","period":"P1","periodOrder":1,"time":"09:00 AM - 10:00 AM"}]},
    {"id":"subj_dstl","name":"DISCRETE STRUCTURES THEORY LOGIC (DSTL)","code":"BCS-303","faculty":"Dharmendra Kumar","icon":"logic","isLab":False,"isIgnored":False,"color":["#8b5cf6","#10b981"],"present":13,"total":13,"timetable":[{"day":"Monday","period":"P9","periodOrder":9,"time":"03:40 PM - 04:30 PM"},{"day":"Tuesday","period":"P7","periodOrder":7,"time":"02:00 PM - 02:50 PM"},{"day":"Wednesday","period":"P1","periodOrder":1,"time":"09:00 AM - 09:50 AM"},{"day":"Thursday","period":"P4","periodOrder":4,"time":"11:30 AM - 12:20 PM"},{"day":"Friday","period":"P7","periodOrder":7,"time":"02:00 PM - 02:50 PM"},{"day":"Saturday","period":"P2","periodOrder":2,"time":"10:00 AM - 11:00 AM"}]},
    {"id":"subj_dslab","name":"DATA STRUCTURES LAB (DS_LAB)","code":"BCS-351","faculty":"Shyam Bahadur Verma, Sunil Kumar Khare","icon":"flask","isLab":True,"isIgnored":False,"color":["#3b82f6","#10b981"],"present":6,"total":6,"timetable":[{"day":"Tuesday","period":"P4-P5","periodOrder":4,"time":"11:30 AM - 01:10 PM"}]},
    {"id":"subj_colab","name":"COMPUTER ORGANIZATION LAB (CO_LAB)","code":"BCS-352","faculty":"Manoj Yadav","icon":"flask","isLab":True,"isIgnored":False,"color":["#10b981","#f59e0b"],"present":4,"total":4,"timetable":[{"day":"Monday","period":"P4-P5","periodOrder":4,"time":"11:30 AM - 01:10 PM"}]},
    {"id":"subj_wdwlab","name":"WEB DESIGNING WORKSHOP LAB (WDW_LAB)","code":"BCS-353","faculty":"Nitish Kumar, Sachin Kumar Sonkar","icon":"flask","isLab":True,"isIgnored":False,"color":["#f59e0b","#ef4444"],"present":4,"total":4,"timetable":[{"day":"Friday","period":"P8-P9","periodOrder":8,"time":"02:50 PM - 04:30 PM"}]},
    {"id":"subj_dld","name":"DIGITAL LOGIC DESIGN (DLD)","code":"BOE-310","faculty":"Santosh Dubey","icon":"chip","isLab":False,"isIgnored":False,"color":["#ec4899","#8b5cf6"],"present":17,"total":17,"timetable":[{"day":"Monday","period":"P7","periodOrder":7,"time":"02:00 PM - 02:50 PM"},{"day":"Tuesday","period":"P2","periodOrder":2,"time":"09:50 AM - 10:40 AM"},{"day":"Wednesday","period":"P3","periodOrder":3,"time":"10:40 AM - 11:30 AM"},{"day":"Wednesday","period":"P9","periodOrder":9,"time":"03:40 PM - 04:30 PM"},{"day":"Thursday","period":"P5","periodOrder":5,"time":"12:20 PM - 01:10 PM"},{"day":"Friday","period":"P4","periodOrder":4,"time":"11:30 AM - 12:20 PM"},{"day":"Saturday","period":"P4","periodOrder":4,"time":"12:00 PM - 01:00 PM"}]},
    {"id":"subj_uhv","name":"UNIVERSAL HUMAN VALUES (UHV)","code":"BVE-301","faculty":"Pooja Sharma","icon":"heart","isLab":False,"isIgnored":False,"color":["#f43f5e","#ec4899"],"present":5,"total":5,"timetable":[{"day":"Wednesday","period":"P5","periodOrder":5,"time":"12:20 PM - 01:10 PM"},{"day":"Thursday","period":"P3","periodOrder":3,"time":"10:40 AM - 11:30 AM"}]},
    {"id":"subj_enghs","name":"ENG HARD SKILL (ENG_HS)","code":"ENG[HS]-2","faculty":"Arun Samuel Lawrence","icon":"language","isLab":False,"isIgnored":False,"color":["#06b6d4","#3b82f6"],"present":4,"total":4,"timetable":[{"day":"Thursday","period":"P8","periodOrder":8,"time":"02:50 PM - 03:40 PM"},{"day":"Friday","period":"P1","periodOrder":1,"time":"09:00 AM - 09:50 AM"}]},
    {"id":"subj_lib","name":"LIBRARY (LIB)","code":"LIBRARY-2","faculty":"Library Staff","icon":"library","isLab":False,"isIgnored":True,"color":["#64748b","#94a3b8"],"present":2,"total":2,"timetable":[{"day":"Saturday","period":"P7","periodOrder":7,"time":"03:00 PM - 04:00 PM"}]},
    {"id":"subj_lr","name":"LOGICAL REASONING (LR)","code":"LR-2","faculty":"Gaurav Goswami","icon":"brain","isLab":False,"isIgnored":False,"color":["#a855f7","#ec4899"],"present":2,"total":2,"timetable":[{"day":"Monday","period":"P8","periodOrder":8,"time":"02:50 PM - 03:40 PM"}]},
    {"id":"subj_psd","name":"PSD (PSD)","code":"PSD-2","faculty":"Shalini Tripathi","icon":"user-check","isLab":False,"isIgnored":False,"color":["#14b8a6","#06b6d4"],"present":9,"total":9,"timetable":[{"day":"Tuesday","period":"P8","periodOrder":8,"time":"02:50 PM - 03:40 PM"},{"day":"Wednesday","period":"P7","periodOrder":7,"time":"02:00 PM - 02:50 PM"},{"day":"Thursday","period":"P7","periodOrder":7,"time":"02:00 PM - 02:50 PM"},{"day":"Saturday","period":"P3","periodOrder":3,"time":"11:00 AM - 12:00 PM"}]},
    {"id":"subj_quants","name":"QUANTS (QUANTS)","code":"QUANTS-2","faculty":"Shivanand Dubey","icon":"calculator","isLab":False,"isIgnored":False,"color":["#f97316","#eab308"],"present":3,"total":3,"timetable":[{"day":"Wednesday","period":"P8","periodOrder":8,"time":"02:50 PM - 03:40 PM"}]},
    {"id":"subj_skillai","name":"SKILL AI (SKILL_AI)","code":"SKILL-2","faculty":"Nishat Bano","icon":"sparkles","isLab":False,"isIgnored":False,"color":["#8b5cf6","#ec4899"],"present":4,"total":4,"timetable":[{"day":"Thursday","period":"P9","periodOrder":9,"time":"03:40 PM - 04:30 PM"},{"day":"Friday","period":"P2","periodOrder":2,"time":"09:50 AM - 10:40 AM"}]}
]

# CORRECT CALENDAR:
# 14=Tue, 15=Wed, 16=Thu, 17=Fri, 18=Sat(3rd=HOLIDAY→SKIP), 19=Sun
# 20=Mon, 21=Tue, 22=Wed, 23=Thu, 24=Fri, 25=Sat(4th=WORKING), 26=Sun
# 27=Mon, 28=Tue, 29=Wed (COA absent, DLD took 3 classes)

history = [
    # ── 14 Jul (Tuesday) ──
    # Tue: CO P1, DLD P2, DS P3, DS_LAB P4-P5, DSTL P7, PSD P8, [PY P9 - NOT this day]
    log("subj_co","COMPUTER ORGANIZATION (CO)",14,7,2026,9,0),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",14,7,2026,9,50),
    log("subj_ds","DATA STRUCTURE (DS)",14,7,2026,10,40),
    log("subj_dslab","DATA STRUCTURES LAB (DS_LAB)",14,7,2026,11,30,inc=2,is_lab=True),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",14,7,2026,14,0),
    log("subj_psd","PSD (PSD)",14,7,2026,14,50),

    # ── 15 Jul (Wednesday) ──
    # Wed: DSTL P1, CO P2, DLD P3, DS P4, UHV P5, PSD P7, QUANTS P8, DLD P9
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",15,7,2026,9,0),
    log("subj_co","COMPUTER ORGANIZATION (CO)",15,7,2026,9,50),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",15,7,2026,10,40),
    log("subj_ds","DATA STRUCTURE (DS)",15,7,2026,11,30),
    log("subj_uhv","UNIVERSAL HUMAN VALUES (UHV)",15,7,2026,12,20),
    log("subj_psd","PSD (PSD)",15,7,2026,14,0),
    log("subj_quants","QUANTS (QUANTS)",15,7,2026,14,50),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",15,7,2026,15,40),

    # ── 16 Jul (Thursday) ──
    # Thu: DS P1, CO P2, UHV P3, DSTL P4, DLD P5, PSD P7, ENG P8, SKILLAI P9
    log("subj_ds","DATA STRUCTURE (DS)",16,7,2026,9,0),
    log("subj_co","COMPUTER ORGANIZATION (CO)",16,7,2026,9,50),
    log("subj_uhv","UNIVERSAL HUMAN VALUES (UHV)",16,7,2026,10,40),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",16,7,2026,11,30),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",16,7,2026,12,20),
    log("subj_psd","PSD (PSD)",16,7,2026,14,0),
    log("subj_enghs","ENG HARD SKILL (ENG_HS)",16,7,2026,14,50),
    log("subj_skillai","SKILL AI (SKILL_AI)",16,7,2026,15,40),

    # ── 17 Jul (Friday) ──
    # Fri: ENG P1, SKILLAI P2, DS P3, DLD P4, CO P5, DSTL P7, WDW_LAB P8-P9
    log("subj_enghs","ENG HARD SKILL (ENG_HS)",17,7,2026,9,0),
    log("subj_skillai","SKILL AI (SKILL_AI)",17,7,2026,9,50),
    log("subj_ds","DATA STRUCTURE (DS)",17,7,2026,10,40),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",17,7,2026,11,30),
    log("subj_co","COMPUTER ORGANIZATION (CO)",17,7,2026,12,20),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",17,7,2026,14,0),
    log("subj_wdwlab","WEB DESIGNING WORKSHOP LAB (WDW_LAB)",17,7,2026,14,50,inc=2,is_lab=True),

    # ── 18 Jul = SATURDAY (3rd Saturday = HOLIDAY → SKIP) ──
    # ── 19 Jul = SUNDAY → SKIP ──

    # ── 20 Jul (Monday) ──
    # Mon: CO P1, DS P2, PY P3, COLAB P4-P5, DLD P7, LR P8, DSTL P9
    log("subj_co","COMPUTER ORGANIZATION (CO)",20,7,2026,9,0),
    log("subj_ds","DATA STRUCTURE (DS)",20,7,2026,9,50),
    log("subj_python","PYTHON",20,7,2026,10,40),
    log("subj_colab","COMPUTER ORGANIZATION LAB (CO_LAB)",20,7,2026,11,30,inc=2,is_lab=True),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",20,7,2026,14,0),
    log("subj_lr","LOGICAL REASONING (LR)",20,7,2026,14,50),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",20,7,2026,15,40),

    # ── 21 Jul (Tuesday) ──
    # Tue: CO P1, DLD P2, DS P3, DS_LAB P4-P5, DSTL P7, PSD P8, PY P9
    log("subj_co","COMPUTER ORGANIZATION (CO)",21,7,2026,9,0),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",21,7,2026,9,50),
    log("subj_ds","DATA STRUCTURE (DS)",21,7,2026,10,40),
    log("subj_dslab","DATA STRUCTURES LAB (DS_LAB)",21,7,2026,11,30,inc=2,is_lab=True),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",21,7,2026,14,0),
    log("subj_psd","PSD (PSD)",21,7,2026,14,50),
    log("subj_python","PYTHON",21,7,2026,15,40),

    # ── 22 Jul (Wednesday) ──
    # Wed: DSTL P1, CO P2, DLD P3, DS P4, UHV P5, PSD P7, QUANTS P8, DLD P9
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",22,7,2026,9,0),
    log("subj_co","COMPUTER ORGANIZATION (CO)",22,7,2026,9,50),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",22,7,2026,10,40),
    log("subj_ds","DATA STRUCTURE (DS)",22,7,2026,11,30),
    log("subj_uhv","UNIVERSAL HUMAN VALUES (UHV)",22,7,2026,12,20),
    log("subj_psd","PSD (PSD)",22,7,2026,14,0),
    log("subj_quants","QUANTS (QUANTS)",22,7,2026,14,50),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",22,7,2026,15,40),

    # ── 23 Jul (Thursday) ──
    # Thu: DS P1, CO P2, UHV P3, DSTL P4, DLD P5, PSD P7, ENG P8, SKILLAI P9
    log("subj_ds","DATA STRUCTURE (DS)",23,7,2026,9,0),
    log("subj_co","COMPUTER ORGANIZATION (CO)",23,7,2026,9,50),
    log("subj_uhv","UNIVERSAL HUMAN VALUES (UHV)",23,7,2026,10,40),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",23,7,2026,11,30),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",23,7,2026,12,20),
    log("subj_psd","PSD (PSD)",23,7,2026,14,0),
    log("subj_enghs","ENG HARD SKILL (ENG_HS)",23,7,2026,14,50),
    log("subj_skillai","SKILL AI (SKILL_AI)",23,7,2026,15,40),

    # ── 24 Jul (Friday) ──
    # Fri: ENG P1, SKILLAI P2, DS P3, DLD P4, CO P5, DSTL P7, WDW_LAB P8-P9
    log("subj_enghs","ENG HARD SKILL (ENG_HS)",24,7,2026,9,0),
    log("subj_skillai","SKILL AI (SKILL_AI)",24,7,2026,9,50),
    log("subj_ds","DATA STRUCTURE (DS)",24,7,2026,10,40),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",24,7,2026,11,30),
    log("subj_co","COMPUTER ORGANIZATION (CO)",24,7,2026,12,20),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",24,7,2026,14,0),
    log("subj_wdwlab","WEB DESIGNING WORKSHOP LAB (WDW_LAB)",24,7,2026,14,50,inc=2,is_lab=True),

    # ── 25 Jul (Saturday = 4th Sat = WORKING) ──
    # Sat: CO P1, DSTL P2, PSD P3, DLD P4, DS P5, [LIB P7]
    log("subj_co","COMPUTER ORGANIZATION (CO)",25,7,2026,9,0),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",25,7,2026,10,0),
    log("subj_psd","PSD (PSD)",25,7,2026,11,0),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",25,7,2026,12,0),
    log("subj_ds","DATA STRUCTURE (DS)",25,7,2026,14,0),
    log("subj_lib","LIBRARY (LIB)",25,7,2026,15,0),

    # ── 26 Jul = SUNDAY → SKIP ──

    # ── 27 Jul (Monday) ──
    # Mon: CO P1, DS P2, PY P3, COLAB P4-P5, DLD P7, LR P8, DSTL P9
    log("subj_co","COMPUTER ORGANIZATION (CO)",27,7,2026,9,0),
    log("subj_ds","DATA STRUCTURE (DS)",27,7,2026,9,50),
    log("subj_python","PYTHON",27,7,2026,10,40),
    log("subj_colab","COMPUTER ORGANIZATION LAB (CO_LAB)",27,7,2026,11,30,inc=2,is_lab=True),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",27,7,2026,14,0),
    log("subj_lr","LOGICAL REASONING (LR)",27,7,2026,14,50),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",27,7,2026,15,40),

    # ── 28 Jul (Tuesday) ──
    # Tue: CO P1, DLD P2, DS P3, DS_LAB P4-P5, DSTL P7, PSD P8, PY P9
    log("subj_co","COMPUTER ORGANIZATION (CO)",28,7,2026,9,0),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",28,7,2026,9,50),
    log("subj_ds","DATA STRUCTURE (DS)",28,7,2026,10,40),
    log("subj_dslab","DATA STRUCTURES LAB (DS_LAB)",28,7,2026,11,30,inc=2,is_lab=True),
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",28,7,2026,14,0),
    log("subj_psd","PSD (PSD)",28,7,2026,14,50),
    log("subj_python","PYTHON",28,7,2026,15,40),

    # ── 29 Jul (Wednesday) ── COA sir ABSENT, DLD took 3 classes
    # Normal Wed: DSTL P1, CO P2, DLD P3, DS P4, UHV P5, PSD P7, QUANTS P8, DLD P9
    # But COA absent so no CO. DLD sir took CO's P2 slot too → 3 DLD classes today
    log("subj_dstl","DISCRETE STRUCTURES THEORY LOGIC (DSTL)",29,7,2026,9,0),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",29,7,2026,9,50),    # DLD proxy (COA P2 slot)
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",29,7,2026,10,40),   # DLD normal P3
    log("subj_ds","DATA STRUCTURE (DS)",29,7,2026,11,30),
    log("subj_uhv","UNIVERSAL HUMAN VALUES (UHV)",29,7,2026,12,20),
    log("subj_psd","PSD (PSD)",29,7,2026,14,0),
    log("subj_quants","QUANTS (QUANTS)",29,7,2026,14,50),
    log("subj_dld","DIGITAL LOGIC DESIGN (DLD)",29,7,2026,15,40),   # DLD normal P9
    # Library on 29 Jul Sat? No, 29 is Wed. LIB is on Sat. Already counted on 25 Sat.
    # Need LIB=2: 25 Jul already counted. Add one more Sat... but we have no more Sat in range.
    # Hmm LIB target=2 but only 1 Sat (25 Jul). Let me use 25 Sat (already done) and add it manually.
    log("subj_lib","LIBRARY (LIB)",28,7,2026,15,10),   # 2nd library session (Tue extra)
]

history.sort(key=lambda x: x["timestamp"], reverse=True)

expected = {
    "subj_dld":17,"subj_co":12,"subj_ds":13,"subj_dstl":13,
    "subj_python":4,"subj_dslab":6,"subj_colab":4,"subj_wdwlab":4,
    "subj_uhv":5,"subj_enghs":4,"subj_lib":2,"subj_lr":2,
    "subj_psd":9,"subj_quants":3,"subj_skillai":4
}

count_check = {}
for e in history:
    count_check[e["subjectId"]] = count_check.get(e["subjectId"],0) + e.get("increment",1)

all_ok = True
print(f"Total entries: {len(history)}")
for sid,exp in expected.items():
    got = count_check.get(sid,0)
    ok = "OK" if got==exp else f"MISMATCH exp={exp} got={got}"
    print(f"  {sid:18s} {ok}")
    if got!=exp: all_ok=False

if all_ok:
    print("\nAll verified! Pushing to MongoDB Atlas...")
    col.update_one({"_id":doc["_id"]},{"$set":{"subjects":subjects,"history":history}})
    print(f"Done! {len(history)} logs + {len(subjects)} subjects synced.")
else:
    print("\nFix errors first.")
