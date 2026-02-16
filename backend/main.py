from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine, Base
import models

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