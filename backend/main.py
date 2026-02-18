from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine, Base
import models
import pandas as pd
from fastapi import UploadFile, File
import shutil
import os

# 1. Create Tables (If they don't exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 2. Allow React to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Define what data we expect from React
class LoginRequest(BaseModel):
    username: str
    password: str

class BatchCreate(BaseModel):
    batch_id: str   # We changed this to String/Varchar earlier
    batch_name: str
    current_semester: int

# 5. Student model for input
class StudentCreate(BaseModel):
    ktu_id: str
    student_name: str
    batch_id: str

class UserCreate(BaseModel):
    user_id: str
    username: str
    password: str
    role: str = "faculty" # Default is faculty

# 5. The Login API
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by username
    user = db.query(models.User).filter(models.User.username == request.username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check password (In real life, use hashing!)
    if user.password_hash != request.password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    return {"status": "success", "role": user.role, "username": user.username}

# --- ADD THIS BLOCK ---
@app.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    # fetch all courses from the table
    courses = db.query(models.CourseMaster).all()
    return courses

# --- GET ALL BATCHES ---
@app.get("/batches")
def get_batches(db: Session = Depends(get_db)):
    return db.query(models.BatchMaster).all()

# --- GET ALL STUDENTS ---
@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(models.StudentMaster).all()

# --- ADD A SINGLE STUDENT ---
@app.post("/students")
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    # Check if student already exists
    existing = db.query(models.StudentMaster).filter(models.StudentMaster.ktu_id == student.ktu_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    # Check if batch exists
    batch_exists = db.query(models.BatchMaster).filter(models.BatchMaster.batch_id == student.batch_id).first()
    if not batch_exists:
        raise HTTPException(status_code=404, detail="Batch does not exist")
    
    new_student = models.StudentMaster(
        ktu_id=student.ktu_id,
        student_name=student.student_name,
        batch_id=student.batch_id
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return {"status": "success", "student": new_student}

# --- ADD A NEW BATCH ---
@app.post("/batches")
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    # Check if batch ID already exists
    existing = db.query(models.BatchMaster).filter(models.BatchMaster.batch_id == batch.batch_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batch ID already exists")

    new_batch = models.BatchMaster(
        batch_id=batch.batch_id,
        batch_name=batch.batch_name,
        current_semester=batch.current_semester
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return {"status": "success", "batch": new_batch}

# --- UPGRADE BATCH SEMESTER ---
@app.put("/batches/{batch_id}/upgrade")
def upgrade_semester(batch_id: str, db: Session = Depends(get_db)):
    # 1. Find the batch
    batch = db.query(models.BatchMaster).filter(models.BatchMaster.batch_id == batch_id).first()
    
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # 2. Add +1 to the semester
    # (Optional: You can add a check like 'if batch.current_semester < 8:')
    batch.current_semester += 1
    
    # 3. Save changes
    db.commit()
    db.refresh(batch)
    
    return {"status": "success", "new_semester": batch.current_semester}

# --- BULK UPLOAD STUDENTS (Updated for String Batch ID) ---
@app.post("/upload-students")
async def upload_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(file.file)
        
        added_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # 1. Clean data (Ensure everything is string)
                k_id = str(row['ktu_id']).strip()
                s_name = str(row['student_name']).strip()
                
                # 2. Handle Batch ID (Keep as String, don't convert to int)
                # If Excel has no batch_id, we warn the user or skip
                if 'batch_id' not in row or pd.isna(row['batch_id']):
                    raise Exception("Missing batch_id")
                
                b_id = str(row['batch_id']).strip()

                # 3. Check if Student exists
                exists = db.query(models.StudentMaster).filter(models.StudentMaster.ktu_id == k_id).first()
                
                # 4. Check if Batch exists (Safety Check)
                batch_exists = db.query(models.BatchMaster).filter(models.BatchMaster.batch_id == b_id).first()
                if not batch_exists:
                    raise Exception(f"Batch '{b_id}' does not exist. Create it first!")

                if not exists:
                    new_student = models.StudentMaster(
                        ktu_id=k_id,
                        student_name=s_name,
                        batch_id=b_id
                    )
                    db.add(new_student)
                    added_count += 1
            except Exception as row_error:
                errors.append(f"Row {index+2}: {str(row_error)}")
        
        db.commit()
        return {
            "status": "success", 
            "added": added_count, 
            "errors": errors if errors else "None"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File Error: {str(e)}")
    
# --- GET ALL USERS (Except Admin) ---
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    # We filter to show only Faculty to keep the list clean
    return db.query(models.User).filter(models.User.role == 'faculty').all()

# --- ADD A NEW FACULTY USER ---
@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if User ID exists
    existing = db.query(models.User).filter(models.User.user_id == user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User ID already exists")

    # 2. Create the new user
    new_user = models.User(
        user_id=user.user_id,
        username=user.username,
        password_hash=user.password, # Store password (in real app, hash this!)
        role='faculty'          # Force role to be faculty
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "user": new_user}

# --- GET USER BY USERNAME ---
@app.get("/users/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- ADD TO main.py ---

# 1. Pydantic Model for receiving the Exam Config
class ExamConfigCreate(BaseModel):
    course_code: str
    date: str  # YYYY-MM-DD
    series_type: str
    pattern_config: dict  # This receives the JSON (Rules, Max Marks)

@app.post("/exams")
def create_exam_config(exam: ExamConfigCreate, db: Session = Depends(get_db)):
    # Create the new exam entry
    new_exam = models.ExamConfig(
        course_code=exam.course_code,
        date=exam.date,
        series_type=exam.series_type,
        pattern_config=exam.pattern_config,
        status="scheduled"
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    
    # Return the ID so the frontend can use it for the next step (Workspace)
    return {"status": "success", "exam_id": new_exam.exam_id}

# --- ADD THESE TO main.py ---

# 1. Get Exam Details (Critical for Workspace to know the pattern)
@app.get("/exams/{exam_id}")
def get_exam_details(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.ExamConfig).filter(models.ExamConfig.exam_id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

# 2. Get Students by Batch ID (To populate the Right Panel)
@app.get("/batches/{batch_id}/students")
def get_batch_students(batch_id: str, db: Session = Depends(get_db)):
    students = db.query(models.StudentMaster).filter(models.StudentMaster.batch_id == batch_id).all()
    return students