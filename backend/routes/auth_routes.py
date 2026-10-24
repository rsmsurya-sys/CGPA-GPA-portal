from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.models import UserRegister, UserLogin, UserResponse, TokenResponse
from backend.database import get_db, User
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication & JWT (PostgreSQL)"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email is already registered
    existing_result = await db.execute(select(User).where(User.email == user_data.email.lower().strip()))
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        password=hashed_pw,
        register_no=user_data.register_no.strip() if user_data.register_no else None,
        department=user_data.department or "CSE",
        college_name=user_data.college_name or "Anna University Affiliated Campus",
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_user)
    await db.flush() # Flushes to get new_user.id
    await db.refresh(new_user)

    user_id_str = str(new_user.id)
    access_token = create_access_token(data={"sub": user_id_str, "email": new_user.email})

    user_resp = UserResponse(
        id=user_id_str,
        name=new_user.name,
        email=new_user.email,
        register_no=new_user.register_no,
        department=new_user.department,
        college_name=new_user.college_name,
        created_at=new_user.created_at,
    )

    return TokenResponse(access_token=access_token, user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email.lower().strip()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = str(user.id)
    access_token = create_access_token(data={"sub": user_id_str, "email": user.email})

    user_resp = UserResponse(
        id=user_id_str,
        name=user.name,
        email=user.email,
        register_no=user.register_no,
        department=user.department or "CSE",
        college_name=user.college_name,
        created_at=user.created_at,
    )

    return TokenResponse(access_token=access_token, user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        register_no=current_user.register_no,
        department=current_user.department or "CSE",
        college_name=current_user.college_name,
        created_at=current_user.created_at,
    )
