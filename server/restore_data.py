from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://anshujaiswal3000_db_user:WwRv7a5ovLjITBCU@cluster0.msyxzky.mongodb.net/attendx?retryWrites=true&w=majority"

client = MongoClient(MONGODB_URI)
db = client["attendx"]
col = db["userdatas"]
doc = col.find_one({})

if not doc:
    print("No document found in MongoDB Atlas")
    exit()

# Seed complete subjects & history
seed_subjects = [
    { "id": "sub_dld", "name": "DIGITAL LOGIC DESIGN", "code": "DLD", "present": 18, "total": 18, "timetable": [{"day": "Monday", "time": "09:00 AM - 09:50 AM"}] },
    { "id": "sub_ds", "name": "DATA STRUCTURE", "code": "DS", "present": 16, "total": 16, "timetable": [{"day": "Monday", "time": "09:50 AM - 10:40 AM"}] },
    { "id": "sub_coa", "name": "COMPUTER ORGANIZATION & ARCHITECTURE", "code": "COA", "present": 14, "total": 14, "timetable": [{"day": "Monday", "time": "10:40 AM - 11:30 AM"}] },
    { "id": "sub_py", "name": "PYTHON PROGRAMMING", "code": "PYTHON", "present": 4, "total": 4, "timetable": [{"day": "Tuesday", "time": "09:00 AM - 09:50 AM"}] },
    { "id": "sub_maths", "name": "DISCRETE MATHEMATICS", "code": "MATHS", "present": 15, "total": 15, "timetable": [{"day": "Wednesday", "time": "09:00 AM - 09:50 AM"}] },
    { "id": "sub_uhv", "name": "UNIVERSAL HUMAN VALUES", "code": "UHV", "present": 12, "total": 12, "timetable": [{"day": "Thursday", "time": "09:00 AM - 09:50 AM"}] },
    { "id": "sub_psd", "name": "PERSONALITY & SKILL DEVELOPMENT", "code": "PSD", "present": 10, "total": 10, "timetable": [{"day": "Friday", "time": "09:00 AM - 09:50 AM"}] },
    { "id": "sub_lib", "name": "LIBRARY", "code": "LIB", "present": 2, "total": 2, "excludeFromTotal": True, "timetable": [{"day": "Saturday", "time": "09:00 AM - 09:50 AM"}] }
]

col.update_one(
    {"_id": doc["_id"]},
    {"$set": {"subjects": seed_subjects}}
)

print("✅ MongoDB Atlas subjects restored successfully!")
