from database.queries import execute_query
from fastapi import HTTPException, APIRouter, Request, Depends
from auth.hashing import verify_password, hash_password
from auth.jwt_handler import create_access_token, get_current_user

router = APIRouter(tags=["auth"])

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.post("/isAlreadyLoggedIn")
async def isAlreadyLoggedIn(request:Request):
    token = await request.json()
    user = get_current_user(token)
    print("user", user)
    if user["e-mail"]:
        return True
    else:
        return False
        
    

@router.post("/login")
async def login(request: Request):
    login_data = await request.json()
    get_user_script = """SELECT id, restaurant_name, e_mail, password_hash FROM customers WHERE e_mail = %s"""
    user_data = execute_query(get_user_script, (login_data["e_mail"],), True)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials") 
    print("userdata",user_data[0]["password_hash"])
    pw_hash = user_data[0]["password_hash"]
    print("pw_hash",user_data)
    if verify_password(login_data["password"], pw_hash):
        access_token = create_access_token(
            data={"id": user_data[0]["id"],
                "restaurant": user_data[0]["restaurant_name"],
                "e-mail": user_data[0]["e_mail"]}, 
        )
        return {"access_token": access_token, "token_type": "bearer", "success":True}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
@router.post("/sign-up")
async def sign_up(signup_data):
    restaurant_name = signup_data["restaurant_name"]
    e_mail = signup_data["e_mail"]
    hashed_password = hash_password(signup_data["password"])
    
    if_exist_check_script = """SELECT restaurant_name FROM customers WHERE restaurant_name = %s"""
    is_exist = execute_query(if_exist_check_script, (restaurant_name,), True)
            
    if is_exist:
        raise HTTPException(status_code=400, detail="Restaurant already exists")
    insert_script = """INSERT INTO customers (restaurant_name, e_mail, password_hash)
                          VALUES (%s, %s, %s)"""
    values = (restaurant_name, e_mail, hashed_password)
    execute_query(insert_script, values)
    return {"status":"success"}   
