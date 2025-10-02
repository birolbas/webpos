from jose import jwt, JWTError
from fastapi import HTTPException, Depends, Cookie
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "ASDD7ASF46ASG48ARGDFGHKasdf21SADASGSYHTDMKUMDTYUJ"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        id: int = payload.get("id")
        email: str = payload.get("e-mail")
        print(email)
        restaurant: str = payload.get("restaurant")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": id,
            "e-mail": email,
            "restaurant": restaurant}
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
