from database.config import app, get_db_connection, SERVER_CONFIG
from fastapi import Depends, Request, APIRouter
from auth.jwt_handler import get_current_user
from database.queries import execute_query
from datetime import datetime
import json
router = APIRouter(tags=["orders"])

@router.get("/get_payment_orders/{table_id}")
async def get_payment_orders(table_id, customer = Depends(get_current_user)):
    """Get payment orders from database"""
    restaurant = customer["restaurant"]
    print(restaurant)
    orders_in_database = """SELECT * FROM open_checks 
                           WHERE restaurant_name = %s AND table_id = %s"""
    values = (restaurant,table_id)
    data = execute_query(orders_in_database, values, True)
    return data

@router.post("/set_payments/{table_id}")
async def set_payments(table_id: str, request: Request, customer = Depends(get_current_user)):
    payments = await request.json()
    payments_json = json.dumps(payments)
    restaurant = customer["restaurant"]
    print(payments_json)
    orders_in_database = """UPDATE open_checks 
                           SET payments = %s
                           WHERE restaurant_name = %s AND table_id = %s"""
    values = (payments_json, restaurant, table_id)
    execute_query(orders_in_database,values)
    return {"status": "success"}

@router.post("/close_check/{table_id}")
async def close_check(table_id: str, request: Request, customer = Depends(get_current_user)):
    """Close a check"""
    get_open_check = """SELECT * FROM open_checks WHERE table_id = %s AND restaurant_name = %s"""
    restaurant = customer["restaurant"]
    get_open_check_values = (table_id,restaurant)
    check_info = execute_query(get_open_check, get_open_check_values, True)
    check_info = check_info[0]
    if not check_info:
        return 404
    else:
        id_val = check_info["id"]
        restaurant_name = restaurant
        check_number = check_info["check_number"]
        opening_date = check_info["openningdate"]
        products = json.dumps(check_info["products"])
        total_price = check_info["total_price"]
        payments = json.dumps(check_info["payments"]) if check_info["payments"] else None
        guest_count = check_info["guest_count"]
        opening_time = check_info["openningtime"]
        check_discounts = json.dumps(check_info["checkdiscounts"])
        total_discount = check_info["total_discount"]
        total_service_charge = check_info["total_service_charge"]
        check_service_charges = json.dumps(check_info["checkservicecharges"])
        tax_total = check_info["tax_total"] 

        today = datetime.today().strftime("%Y-%m-%d")
        hour = datetime.now().strftime("%H:%M:%S")
        update_closed_check = """INSERT INTO closed_checks
                               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        values = (id_val, restaurant_name, table_id, check_number, opening_date,
                products, total_price, payments, guest_count, opening_time, today, hour, check_discounts, total_discount, total_service_charge, check_service_charges, tax_total)
        execute_query(update_closed_check, values)
        delete_open_check = """DELETE FROM open_checks WHERE table_id = %s AND restaurant_name = %s"""
        execute_query(delete_open_check, (table_id,restaurant))
        return {"status": "success"}