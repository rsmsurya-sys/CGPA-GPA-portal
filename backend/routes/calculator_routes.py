from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException
from backend.models import (
    CalculateSemesterRequest,
    SemesterResult,
    CalculateCGPARequest,
    CGPAResult,
    WhatIfRequest,
    WhatIfResult,
    RegulationGradePointMap,
)

router = APIRouter(prefix="/api/calculate", tags=["Academic Engine & Calculations"])

def get_points_map(regulation_key: str) -> Dict[str, float]:
    key = regulation_key.upper().replace("-", "_")
    if key in ("AU_2021", "REG2021", "2021"):
        return RegulationGradePointMap.AU_2021
    elif key in ("AU_2017", "REG2017", "2017"):
        return RegulationGradePointMap.AU_2017
    elif key in ("US_4_0", "US4", "4.0"):
        return RegulationGradePointMap.US_4_0
    return RegulationGradePointMap.AU_2021

def is_passing(grade: str, regulation_key: str) -> bool:
    points_map = get_points_map(regulation_key)
    points = points_map.get(grade.upper(), 0.0)
    g = grade.upper()
    if g in ("U", "RA", "SA", "W", "F", "AB"):
        return False
    return points > 0.0

@router.get("/regulations")
def get_regulations():
    return {
        "regulations": [
            {
                "key": "AU_2021",
                "name": "Anna University Regulation 2021",
                "scale": 10.0,
                "grades": RegulationGradePointMap.AU_2021,
            },
            {
                "key": "AU_2017",
                "name": "Anna University Regulation 2017",
                "scale": 10.0,
                "grades": RegulationGradePointMap.AU_2017,
            },
            {
                "key": "US_4_0",
                "name": "US Standard 4.0 Scale",
                "scale": 4.0,
                "grades": RegulationGradePointMap.US_4_0,
            },
        ]
    }

@router.post("/semester", response_model=SemesterResult)
def calculate_semester_gpa(payload: CalculateSemesterRequest):
    points_map = get_points_map(payload.regulation_key)
    total_credits = 0.0
    earned_credits = 0.0
    quality_points = 0.0
    arrears = 0

    for c in payload.courses:
        credits = float(c.credits)
        grade = c.grade.upper()
        pts = points_map.get(grade, 0.0)
        
        total_credits += credits
        quality_points += credits * pts
        
        if is_passing(grade, payload.regulation_key):
            earned_credits += credits
        else:
            arrears += 1

    gpa = (quality_points / total_credits) if total_credits > 0 else 0.0

    return SemesterResult(
        gpa=round(gpa, 2),
        total_credits=round(total_credits, 1),
        earned_credits=round(earned_credits, 1),
        arrears=arrears,
        quality_points=round(quality_points, 2),
    )

@router.post("/cgpa", response_model=CGPAResult)
def calculate_cumulative_cgpa(payload: CalculateCGPARequest):
    points_map = get_points_map(payload.regulation_key)
    total_credits = 0.0
    total_earned = 0.0
    total_quality_points = 0.0
    total_arrears = 0
    semester_results = {}

    for sem_name, course_list in payload.semesters.items():
        sem_credits = 0.0
        sem_earned = 0.0
        sem_qp = 0.0
        sem_arrears = 0

        for c in course_list:
            credits = float(c.credits)
            grade = c.grade.upper()
            pts = points_map.get(grade, 0.0)

            sem_credits += credits
            sem_qp += credits * pts

            if is_passing(grade, payload.regulation_key):
                sem_earned += credits
            else:
                sem_arrears += 1

        sem_gpa = (sem_qp / sem_credits) if sem_credits > 0 else 0.0
        semester_results[sem_name] = SemesterResult(
            gpa=round(sem_gpa, 2),
            total_credits=round(sem_credits, 1),
            earned_credits=round(sem_earned, 1),
            arrears=sem_arrears,
            quality_points=round(sem_qp, 2),
        )

        total_credits += sem_credits
        total_earned += sem_earned
        total_quality_points += sem_qp
        total_arrears += sem_arrears

    cgpa = (total_quality_points / total_credits) if total_credits > 0 else 0.0

    # Determine standing
    if total_arrears > 0:
        standing = f"Arrear Recovery ({total_arrears} Pending)"
    elif cgpa >= 8.5:
        standing = "First Class with Distinction"
    elif cgpa >= 6.5:
        standing = "First Class"
    elif cgpa >= 5.0:
        standing = "Second Class"
    else:
        standing = "Pass"

    return CGPAResult(
        cgpa=round(cgpa, 2),
        total_credits=round(total_credits, 1),
        total_earned_credits=round(total_earned, 1),
        total_arrears=total_arrears,
        standing=standing,
        semester_results=semester_results,
    )

@router.post("/whatif", response_model=WhatIfResult)
def calculate_what_if_target(payload: WhatIfRequest):
    max_scale = 4.0 if payload.regulation_key == "US_4_0" else 10.0
    target = min(payload.target_cgpa, max_scale)
    curr_cgpa = payload.current_cgpa
    curr_credits = payload.current_credits
    future_credits = payload.future_credits

    if future_credits <= 0:
        raise HTTPException(status_code=400, detail="Future credits must be greater than zero")

    total_target_credits = curr_credits + future_credits
    required_total_qp = target * total_target_credits
    current_qp = curr_cgpa * curr_credits
    needed_qp = required_total_qp - current_qp
    needed_gpa = needed_qp / future_credits

    is_possible = needed_gpa <= max_scale and needed_gpa >= 0.0

    if max_scale == 10.0:
        if needed_gpa > 9.0:
            suggested_grade = "O (Outstanding)"
        elif needed_gpa > 8.0:
            suggested_grade = "A+ (Excellent)"
        elif needed_gpa > 7.0:
            suggested_grade = "A (Very Good)"
        elif needed_gpa > 6.0:
            suggested_grade = "B+ (Good)"
        else:
            suggested_grade = "B (Average)"
    else:
        if needed_gpa > 3.7:
            suggested_grade = "A"
        elif needed_gpa > 3.0:
            suggested_grade = "B+"
        elif needed_gpa > 2.0:
            suggested_grade = "B"
        else:
            suggested_grade = "C"

    if not is_possible and needed_gpa > max_scale:
        message = f"Mathematically unachievable: Requires {round(needed_gpa, 2)} GPA, which exceeds maximum possible scale ({max_scale})."
    elif needed_gpa <= 0:
        message = f"Target already reached! Maintaining current passing grades will preserve your CGPA."
    else:
        message = f"You need to maintain an average of {round(needed_gpa, 2)} GPA across the next {future_credits} credits."

    return WhatIfResult(
        needed_gpa=round(max(0.0, needed_gpa), 2),
        is_possible=is_possible,
        suggested_grade=suggested_grade,
        message=message,
    )
