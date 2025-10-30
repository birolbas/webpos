from database.config import app, get_db_connection, SERVER_CONFIG
from fastapi import Depends, APIRouter, Request
from auth.jwt_handler import get_current_user
from database.queries import execute_query
import json
from datetime import datetime
router = APIRouter(tags=["orders"])

"""remove get orders and change get_orders in react component,"""
@router.get("/get_orders")
async def get_orders(customer = Depends(get_current_user)):
    """Get orders from database"""
    print("customer", customer)
    orders_in_database = """SELECT * FROM open_checks WHERE restaurant_name = %s"""
    values = (customer["restaurant"],)
    data = execute_query(orders_in_database, values, True)
    return data

@router.get("/get_table_order/{table_id}")
async def get_table_order(table_id, customer = Depends(get_current_user)):
    """Get specific table order"""
    script = """Select * from open_checks where restaurant_name = %s AND table_id = %s"""
    values = (customer["restaurant"], table_id)
    data = execute_query(script, values, True)
    return data

@router.post("/orders")
async def create_order(request:Request , customer = Depends(get_current_user)):
    """Send orders to database"""
    order_data = await request.json()
    print("order_dataorder_dataorder_dataorder_dataorder_data",order_data)
    table_id = order_data["table_id"]
    check_number = int(order_data["checkNumber"])
    opening_date = order_data["oppeningDate"]
    orders = json.dumps(order_data["orders"])
    total_price = order_data["total_price"]
    guest_count = order_data["guest_count"]
    check_discounts = json.dumps(order_data["checkDiscounts"])
    total_discount = order_data["total_discount"]
    check_service_charges = json.dumps(order_data["checkServiceCharges"])
    total_service_charge = order_data["total_service_charge"]
    tax_total = order_data["tax_total"]
    restaurant_name = customer["restaurant"]
    is_check_open_script = """SELECT table_id FROM open_checks 
                            WHERE restaurant_name = %s AND table_id = %s"""
    isCheckOpen = execute_query(is_check_open_script,(restaurant_name, table_id), True)
    if isCheckOpen == []:
        opening_time = datetime.now().strftime("%H:%M")
        order_save_script = """INSERT INTO open_checks 
            (restaurant_name, table_id, check_number, openningdate, 
            products, total_price, guest_count,openningtime, checkdiscounts, total_discount, total_service_charge, checkservicecharges, tax_total)
            VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        values = (restaurant_name, table_id, check_number, opening_date, 
                orders, total_price, guest_count, opening_time,check_discounts ,total_discount, total_service_charge,check_service_charges,tax_total)
        execute_query(order_save_script, values)
        return {"status": "success"}
    else:
        order_save_script = """UPDATE open_checks 
        SET products = %s, total_price = %s, guest_count = %s, tax_total=%s, checkdiscounts=%s, total_discount=%s, total_service_charge=%s, checkservicecharges=%s
        WHERE table_id = %s AND restaurant_name = %s"""
        values = (orders, total_price, guest_count, tax_total, check_discounts,total_discount, total_service_charge, check_service_charges ,table_id, restaurant_name)
        execute_query(order_save_script, values)
        return {"status": "success"}
    