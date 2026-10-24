from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- Authentication Models ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    register_no: Optional[str] = Field(None, max_length=30)
    department: Optional[str] = "CSE"
    college_name: Optional[str] = "Anna University Affiliated Campus"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    register_no: Optional[str] = None
    department: Optional[str] = "CSE"
    college_name: Optional[str] = None
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Academic Domain Models ---
class CourseItem(BaseModel):
    id: Optional[Any] = None
    code: str = Field(..., example="CS501")
    course: str = Field(..., example="Advanced Data Structures")
    credits: float = Field(..., ge=0, le=30, example=4.0)
    grade: str = Field(..., example="O")

class RegulationGradePointMap:
    # Anna University 2021 Regulation
    AU_2021 = {
        "O": 10.0, "A+": 9.0, "A": 8.0, "B+": 7.0, "B": 6.0, "C+": 5.0, "U": 0.0, "RA": 0.0, "SA": 0.0, "W": 0.0
    }
    # Anna University 2017 Regulation
    AU_2017 = {
        "O": 10.0, "A+": 9.0, "A": 8.0, "B+": 7.0, "B": 6.0, "RA": 0.0, "SA": 0.0, "W": 0.0
    }
    # US 4.0 Standard Scale
    US_4_0 = {
        "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0
    }

class TranscriptPayload(BaseModel):
    title: Optional[str] = "Academic Transcript"
    student_name: str = "SURAJ R"
    register_no: str = "710023104001"
    college_name: str = "Anna University Affiliated Autonomous Campus"
    degree_name: str = "Bachelor of Engineering (B.E.)"
    academic_year: str = "2023 - 2027"
    department: str = "CSE"
    regulation_key: str = "AU_2021"
    semesters: Dict[str, List[CourseItem]] = {}
    calculated_cgpa: Optional[float] = 0.0
    total_credits: Optional[float] = 0.0
    total_arrears: Optional[int] = 0
    academic_standing: Optional[str] = "First Class with Distinction"

class TranscriptResponse(TranscriptPayload):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


# --- Direct Calculation REST Models ---
class CalculateSemesterRequest(BaseModel):
    regulation_key: str = "AU_2021"
    courses: List[CourseItem]

class SemesterResult(BaseModel):
    gpa: float
    total_credits: float
    earned_credits: float
    arrears: int
    quality_points: float

class CalculateCGPARequest(BaseModel):
    regulation_key: str = "AU_2021"
    semesters: Dict[str, List[CourseItem]]

class CGPAResult(BaseModel):
    cgpa: float
    total_credits: float
    total_earned_credits: float
    total_arrears: int
    standing: str
    semester_results: Dict[str, SemesterResult]

class WhatIfRequest(BaseModel):
    current_cgpa: float = Field(..., ge=0.0, le=10.0)
    current_credits: float = Field(..., ge=0.0)
    target_cgpa: float = Field(..., ge=0.0, le=10.0)
    future_credits: float = Field(..., gt=0.0)
    regulation_key: str = "AU_2021"

class WhatIfResult(BaseModel):
    needed_gpa: float
    is_possible: bool
    suggested_grade: str
    message: str
