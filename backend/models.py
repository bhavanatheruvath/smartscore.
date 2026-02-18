from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Date, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

# --- Enums (For dropdowns) ---
class UserRole(str, enum.Enum):
    admin = "admin"
    faculty = "faculty"

class ExamStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    published = "published"

# --- 1. Users Table (Already Created) ---
class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password_hash = Column(String(100))
    role = Column(Enum(UserRole))

    # Relationship: A faculty user can create many reports
    reports = relationship("ReportArchive", back_populates="faculty")
    
    # Property to return password for JSON serialization
    @property
    def password(self):
        return self.password_hash

# --- 2. Course Master [cite: 105] ---
class CourseMaster(Base):
    __tablename__ = "course_master"

    course_code = Column(String(20), primary_key=True, index=True) # PK
    course_name = Column(String(100))
    department = Column(String(50))

    # Relationship: One course has many exams
    exams = relationship("ExamConfig", back_populates="course")

# --- 3. Batch Master [cite: 108] ---
class BatchMaster(Base):
    __tablename__ = "batch_master"

    batch_id = Column(String(20), primary_key=True, index=True) # PK
    batch_name = Column(String(50)) # e.g., "2024-2026 MCA"
    current_semester = Column(Integer)

    # Relationship: One batch has many students
    students = relationship("StudentMaster", back_populates="batch")

# --- 4. Student Master [cite: 119] ---
class StudentMaster(Base):
    __tablename__ = "student_master"

    ktu_id = Column(String(20), primary_key=True, index=True) # PK
    student_name = Column(String(100))
    batch_id = Column(String(20), ForeignKey("batch_master.batch_id")) #FK

    # Relationships
    batch = relationship("BatchMaster", back_populates="students")
    marks_drafts = relationship("SessionDraftMarks", back_populates="student")

# --- 5. Exam Configuration [cite: 114] ---
class ExamConfig(Base):
    __tablename__ = "exam_config"

    exam_id = Column(Integer, primary_key=True, index=True) # PK
    course_code = Column(String(20), ForeignKey("course_master.course_code")) # FK
    date = Column(Date)
    series_type = Column(String(20)) # e.g., "Series 1", "Series 2"
    
    # Stores rules like "Best of 2", "Max Marks" in JSON format
    pattern_config = Column(JSON) 
    status = Column(Enum(ExamStatus), default=ExamStatus.scheduled)

    # Relationships
    course = relationship("CourseMaster", back_populates="exams")
    draft_marks = relationship("SessionDraftMarks", back_populates="exam")
    reports = relationship("ReportArchive", back_populates="exam")

# --- 6. Session Draft Marks (Temporary Storage) [cite: 128] ---
class SessionDraftMarks(Base):
    __tablename__ = "session_draft_marks"

    session_id = Column(Integer, primary_key=True, index=True) # PK
    exam_id = Column(Integer, ForeignKey("exam_config.exam_id")) # FK
    ktu_id = Column(String(20), ForeignKey("student_master.ktu_id")) # FK
    
    # Stores raw marks: {"Q1": 5, "Q2": 10}
    q_marks_json = Column(JSON) 
    total_obtained = Column(Integer, default=0)
    is_absent = Column(Boolean, default=False)

    # Relationships
    exam = relationship("ExamConfig", back_populates="draft_marks")
    student = relationship("StudentMaster", back_populates="marks_drafts")

# --- 7. Report Archive (Permanent Records) [cite: 118] ---
class ReportArchive(Base):
    __tablename__ = "report_archive"

    report_id = Column(Integer, primary_key=True, index=True) # PK
    exam_id = Column(Integer, ForeignKey("exam_config.exam_id")) # FK
    faculty_id = Column(String(50), ForeignKey("users.user_id")) # FK
    
    file_path = Column(String(255)) # Path to PDF/Excel file
    
    # Stores analytics: {"CO1": 80%, "PassRate": 90%}
    analytics_snapshot = Column(JSON) 
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exam = relationship("ExamConfig", back_populates="reports")
    faculty = relationship("User", back_populates="reports")