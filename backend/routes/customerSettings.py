from database.queries import execute_query
from fastapi import APIRouter, Depends
from auth.jwt_handler import get_current_user
router = APIRouter(tags=["orders"])

@router.get("/customerSettings")
async def get_customer_settings(customer = Depends(get_current_user)):
    script = """SELECT * FROM customer_settings where restaurant_name = %s"""
    values = (customer["restaurant"],)
    data = execute_query(script, values, True)
    print(data)
    return data

@router.get("/get_products")
def get_products(customer = Depends(get_current_user)):
    get_products_script = """ SELECT * FROM PRODUCTS where restaurantname =%s"""
    values = (customer["restaurant"],)
    data = execute_query(get_products_script, values, True)
    return data
