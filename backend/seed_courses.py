from database import SessionLocal, engine
import models

# 1. Ensure tables exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- OPTIONAL: DELETE S1 ELECTIVES (If you added them by mistake) ---
s1_electives_to_remove = ["20MCA161", "20MCA163", "20MCA165", "20MCA167", "20MCA169", "20MCA171"]
print("🧹 Cleaning up S1 Electives...")
for code in s1_electives_to_remove:
    course_to_delete = db.query(models.CourseMaster).filter(models.CourseMaster.course_code == code).first()
    if course_to_delete:
        db.delete(course_to_delete)
        print(f"   [-] Removed: {code}")

# --- THE CORRECT LIST (S1 Core/Labs + S2 Core/Labs/Electives) ---
courses = [
    # --- Semester 1 Core ---
    {"code": "20MCA101", "name": "Mathematical Foundations for Computing Applications", "dept": "MCA"},
    {"code": "20MCA103", "name": "Digital Fundamentals & Computer Architecture", "dept": "MCA"},
    {"code": "20MCA105", "name": "Advanced Data Structures", "dept": "MCA"},
    {"code": "20MCA107", "name": "Advanced Software Engineering Methodology", "dept": "MCA"},
    
    # --- Semester 1 Labs ---
    {"code": "20MCA131", "name": "Programming Lab", "dept": "MCA"},
    {"code": "20MCA133", "name": "Web Programming Lab", "dept": "MCA"},
    {"code": "20MCA135", "name": "Data Structures Lab", "dept": "MCA"},

    # --- Semester 2 Core ---
    {"code": "20MCA102", "name": "Advanced Database Management Systems", "dept": "MCA"},
    {"code": "20MCA104", "name": "Advanced Computer Networks", "dept": "MCA"},
    
    # --- Semester 2 Labs ---
    {"code": "20MCA132", "name": "Object Oriented Programming Lab", "dept": "MCA"},
    {"code": "20MCA134", "name": "Advanced DBMS Lab", "dept": "MCA"},
    {"code": "20MCA136", "name": "Networking & System Administration Lab", "dept": "MCA"},

    # --- Semester 2 Electives ONLY ---
    {"code": "20MCA162", "name": "Applied Statistics", "dept": "MCA"},
    {"code": "20MCA164", "name": "Organizational Behaviour", "dept": "MCA"},
    {"code": "20MCA166", "name": "Cyber Security", "dept": "MCA"},
    {"code": "20MCA168", "name": "Virtualisation and Containers", "dept": "MCA"},
    {"code": "20MCA172", "name": "Advanced Operating Systems", "dept": "MCA"},
]

print("🌱 Seeding Correct Courses...")

for c in courses:
    # Check if course already exists
    exists = db.query(models.CourseMaster).filter(models.CourseMaster.course_code == c["code"]).first()
    
    if not exists:
        new_course = models.CourseMaster(
            course_code=c["code"],
            course_name=c["name"],
            department=c["dept"]
        )
        db.add(new_course)
        print(f"   [+] Added: {c['code']} - {c['name']}")
    else:
        print(f"   [.] Skipped: {c['code']} (Already exists)")

db.commit()
db.close()
print("✅ Course List Updated Successfully!")