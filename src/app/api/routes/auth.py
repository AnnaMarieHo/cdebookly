import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the token using your secret
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        return payload # This contains the user's ID (sub) and email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )