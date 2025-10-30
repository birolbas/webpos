from database.queries import execute_query
from fastapi import APIRouter, Depends
from auth.jwt_handler import get_current_user
router = APIRouter(tags=["orders"])

@router.get("/customerSettings")
async def get_customer_settings(customer = Depends(get_current_user)):
    taxes_script = """SELECT * FROM taxes WHERE restaurant_name = %s"""
    products_script = """select p.*, t.taxpercent 
                        as tax_percent 
                        from products p 
                        join taxes t on t.id = p.tax_id WHERE p.restaurant_name = %s"""
    product_categories_script = """SELECT * FROM product_categories WHERE restaurant_name = %s"""
    tableLayout_script = """SELECT tablelayout FROM customer_settings where restaurant_name = %s"""
    payment_methods_script = """SELECT * FROM payment_methods where restaurant_name = %s"""
    service_charges_script = """SELECT * FROM service_charges where restaurant_name = %s"""
    discounts_script = """SELECT * FROM discounts where restaurant_name = %s"""

    values = (customer["restaurant"],)

    taxes = execute_query(taxes_script, values, True)
    products = execute_query(products_script, values, True)
    product_categories = execute_query(product_categories_script, values, True)
    table_layout = execute_query(tableLayout_script, values, True)
    payment_methods = execute_query(payment_methods_script, values, True)
    service_charges = execute_query(service_charges_script, values, True)
    discounts = execute_query(discounts_script, values, True)

    data = {
        "taxes":taxes,
        "products": products,
        "product_categories": product_categories,
        "table_layout": table_layout,
        "payment_methods": payment_methods,
        "service_charges": service_charges,
        "discounts": discounts
    }

    return data

