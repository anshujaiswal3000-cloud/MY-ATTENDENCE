import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI)
db = client["attendx"]
col = db["userdatas"]
doc = col.find_one({})

if not doc:
    print("No document found")
else:
    history = doc.get("history", [])
    subjects = doc.get("subjects", [])
    print("Total History Logs:", len(history))
    print("Total Subjects:", len(subjects))
    print()
    for s in subjects:
        name = s.get("name", "Unknown")
        present = s.get("present", 0)
        total = s.get("total", 0)
        print(name, "-> Present:", present, "Total:", total)
