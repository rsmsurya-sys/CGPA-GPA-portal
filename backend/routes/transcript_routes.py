from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from backend.models import TranscriptPayload, TranscriptResponse
from backend.database import get_db, Transcript, User
from backend.auth import get_current_user

router = APIRouter(prefix="/api/transcripts", tags=["Transcripts & Records (PostgreSQL)"])

def model_to_response(t: Transcript) -> TranscriptResponse:
    # Serialize semesters if needed
    semesters_data = t.semesters if isinstance(t.semesters, dict) else {}
    return TranscriptResponse(
        id=str(t.id),
        user_id=str(t.user_id),
        title=t.title or "Academic Transcript",
        student_name=t.student_name,
        register_no=t.register_no,
        college_name=t.college_name or "",
        degree_name=t.degree_name or "",
        academic_year=t.academic_year or "",
        department=t.department or "CSE",
        regulation_key=t.regulation_key or "AU_2021",
        semesters=semesters_data,
        calculated_cgpa=float(t.calculated_cgpa or 0.0),
        total_credits=float(t.total_credits or 0.0),
        total_arrears=int(t.total_arrears or 0),
        academic_standing=t.academic_standing or "First Class",
        created_at=t.created_at,
        updated_at=t.updated_at,
    )

@router.post("", response_model=TranscriptResponse, status_code=status.HTTP_201_CREATED)
async def create_or_save_transcript(
    payload: TranscriptPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    new_transcript = Transcript(
        user_id=current_user.id,
        title=payload.title or "Academic Transcript",
        student_name=payload.student_name,
        register_no=payload.register_no,
        college_name=payload.college_name,
        degree_name=payload.degree_name,
        academic_year=payload.academic_year,
        department=payload.department,
        regulation_key=payload.regulation_key,
        semesters=payload.model_dump().get("semesters", {}),
        calculated_cgpa=payload.calculated_cgpa,
        total_credits=payload.total_credits,
        total_arrears=payload.total_arrears,
        academic_standing=payload.academic_standing,
        created_at=now,
        updated_at=now,
    )

    db.add(new_transcript)
    await db.flush()
    await db.refresh(new_transcript)

    return model_to_response(new_transcript)

@router.get("", response_model=List[TranscriptResponse])
async def list_user_transcripts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transcript)
        .where(Transcript.user_id == current_user.id)
        .order_by(desc(Transcript.updated_at))
    )
    transcripts = result.scalars().all()
    return [model_to_response(t) for t in transcripts]

@router.get("/latest", response_model=TranscriptResponse)
async def get_latest_transcript(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transcript)
        .where(Transcript.user_id == current_user.id)
        .order_by(desc(Transcript.updated_at))
        .limit(1)
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="No transcript records found for this account")
    return model_to_response(transcript)

@router.get("/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript_by_id(
    transcript_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        t_id = int(transcript_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transcript ID format")

    result = await db.execute(
        select(Transcript).where(Transcript.id == t_id, Transcript.user_id == current_user.id)
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return model_to_response(transcript)

@router.put("/{transcript_id}", response_model=TranscriptResponse)
async def update_transcript(
    transcript_id: str,
    payload: TranscriptPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        t_id = int(transcript_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transcript ID format")

    result = await db.execute(
        select(Transcript).where(Transcript.id == t_id, Transcript.user_id == current_user.id)
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found or unauthorized")

    now = datetime.now(timezone.utc)
    transcript.title = payload.title
    transcript.student_name = payload.student_name
    transcript.register_no = payload.register_no
    transcript.college_name = payload.college_name
    transcript.degree_name = payload.degree_name
    transcript.academic_year = payload.academic_year
    transcript.department = payload.department
    transcript.regulation_key = payload.regulation_key
    transcript.semesters = payload.model_dump().get("semesters", {})
    transcript.calculated_cgpa = payload.calculated_cgpa
    transcript.total_credits = payload.total_credits
    transcript.total_arrears = payload.total_arrears
    transcript.academic_standing = payload.academic_standing
    transcript.updated_at = now

    await db.flush()
    await db.refresh(transcript)

    return model_to_response(transcript)

@router.delete("/{transcript_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transcript(
    transcript_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        t_id = int(transcript_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transcript ID format")

    result = await db.execute(
        select(Transcript).where(Transcript.id == t_id, Transcript.user_id == current_user.id)
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    await db.delete(transcript)
    return None
