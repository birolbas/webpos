from fastapi import Depends, Request, APIRouter
from auth.jwt_handler import get_current_user
from database.queries import execute_query
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
import json
router = APIRouter(tags=["orders"])

@router.get("/get_payment_orders/{table_id}")
async def get_payment_orders(table_id, customer = Depends(get_current_user)):
    """Get payment orders from database"""
    restaurant = customer["restaurant"]
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
        print(check_info)
        id_val = check_info["id"]
        restaurant_name = restaurant
        check_number = check_info["check_number"]
        opening_date = check_info["openningdate"]
        products = json.dumps(check_info["products"])
        total_price = Decimal(check_info["total_price"])
        payments = json.dumps(check_info["payments"]) if check_info["payments"] else None
        guest_count = check_info["guest_count"]
        opening_time = check_info["openningtime"]
        check_discounts = json.dumps(check_info["checkdiscounts"])
        total_discount = check_info["total_discount"]
        total_service_charge = check_info["total_service_charge"]
        check_service_charges = json.dumps(check_info["checkservicecharges"])
        today = datetime.today().strftime("%Y-%m-%d")
        hour = datetime.now().strftime("%H:%M:%S")
        tax = Decimal('0')
        for payment in json.loads(payments):
            for product in json.loads(products):
                if(payment["isIncludedIncome"]):
                    product_tax = (Decimal(payment["payedPrice"]) / total_price) * (Decimal(product["price"]) * Decimal(product["taxPercent"] / (100 + product["taxPercent"])))
                    tax += product_tax
                    print("tax is", tax)
                    
        tax = tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        update_closed_check = """INSERT INTO closed_checks
                               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        
        values = (id_val, restaurant_name, table_id, check_number, opening_date,
                products, total_price, payments, guest_count, opening_time, today, hour, check_discounts, total_discount, total_service_charge, check_service_charges, tax)
        
        execute_query(update_closed_check, values)
        delete_open_check = """DELETE FROM open_checks WHERE table_id = %s AND restaurant_name = %s"""
        execute_query(delete_open_check, (table_id,restaurant))
        
        ingredientStock_script = """                        
                        UPDATE ingredients i
                        SET stock_quantity = stock_quantity - (ri.quantity * %s)
                        FROM recipe_items ri
                        JOIN recipes r ON r.id = ri.recipe_id
                        WHERE ri.ingredient_id = i.id
                        AND r.id = %s and r.is_sub_recipe = false and i.restaurant_name = %s;
        

                        update ingredients i 
                        set stock_quantity = stock_quantity - (rs.amount * ri.quantity * %s)
                        from recipe_items ri 
                        join recipes r on r.id = ri.recipe_id 
						join recipe_subrecipes rs on rs.subrecipe_id = r.id
                        WHERE ri.ingredient_id = i.id 
                        and rs.recipe_id = %s and r.is_sub_recipe = true and i.restaurant_name = %s
                        """

        for product in check_info["products"]:
            stock_values = (product["amount"], product["related_recipe_id"], "TEST", product["amount"], product["related_recipe_id"], "TEST")
            execute_query(ingredientStock_script, stock_values)
            #execute_query(ingredientStock_script, stock_values)

        return restaurant