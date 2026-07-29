import datetime
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority"

client = MongoClient(MONGODB_URI)
db = client["attendx"]
col = db["userdatas"]
doc = col.find_one({})

if not doc:
    print("No document found in MongoDB Atlas")
    exit()

subjects = doc.get("subjects", [])
history = doc.get("history", [])

# 1. Filter Python logs to strictly 4 dates: 20/07/2026, 21/07/2026, 27/07/2026, 28/07/2026
python_dates = {"20/07/2026", "21/07/2026", "27/07/2026", "28/07/2026"}

# 2. Filter Library logs to strictly 2 dates: 14/07/2026, 25/07/2026
library_dates = {"14/07/2026", "25/07/2026"}

new_history = []
for log in history:
    s_name = (log.get("subjectName") or "").lower()
    s_id = (log.get("subjectId") or "").lower()
    log_date = log.get("date")

    is_python = "python" in s_id or "python" in s_name
    is_library = "lib" in s_id or "library" in s_name

    if is_python:
        if log_date in python_dates:
            new_history.append(log)
    elif is_library:
        if log_date in library_dates:
            new_history.append(log)
    else:
        new_history.append(log)

# Update subject present and total counts
updated_subjects = []
for s in subjects:
    sid = s.get("id", "").lower()
    sname = s.get("name", "").lower()
    is_python = "python" in sid or "python" in sname
    is_library = "lib" in sid or "library" in sname

    if is_python:
        updated_subjects.append({
            **s,
            "present": 4,
            "total": 4
        })
        print("  Updated Python -> Present: 4, Total: 4")
    elif is_library:
        updated_subjects.append({
            **s,
            "present": 2,
            "total": 2,
            "excludeFromTotal": True
        })
        print("  Updated Library -> Present: 2, Total: 2 (excludeFromTotal: True)")
    else:
        updated_subjects.append(s)

col.update_one(
    {"_id": doc["_id"]},
    {"$set": {"subjects": updated_subjects, "history": new_history}}
)

print(f"\n✅ MongoDB Atlas updated! History count: {len(new_history)}")
