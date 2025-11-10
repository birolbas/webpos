from database.queries import execute_query
from fastapi import APIRouter, Depends
from auth.jwt_handler import get_current_user
router = APIRouter(tags=["orders"])

@router.get("/customerSettings")
async def get_customer_settings(customer = Depends(get_current_user)):
    taxes_script = """SELECT * FROM taxes WHERE restaurant_name = %s"""
    products_script = """SELECT 
    p.id,
    p.name AS name,
    p.price AS product_price,
    r.id AS recipe_id,
    r.name AS recipe_name,
	p.activeness,
	p.category_id,
	p.condiment_id,
	p.price,
	p.related_recipe_id,
	p.stock_category_id,
	t.taxpercent,
	t.taxid,
    COALESCE(ing.ingredient_cost, 0) + COALESCE(sub.sub_recipe_cost, 0) AS cost
FROM products p
LEFT JOIN recipes r ON p.related_recipe_id = r.id
LEFT JOIN (
    SELECT 
        ri.recipe_id,
        SUM(ri.quantity * i.cost_per_unit) AS ingredient_cost
    FROM recipe_items ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    GROUP BY ri.recipe_id
) ing ON ing.recipe_id = r.id
LEFT JOIN (
    SELECT 
        rs.recipe_id,
        SUM(sr.sub_cost) AS sub_recipe_cost
    FROM recipe_subrecipes rs
    JOIN (
        SELECT 
            r2.id AS sub_id,
            SUM(ri2.quantity * i2.cost_per_unit) AS sub_cost
        FROM recipes r2
        JOIN recipe_items ri2 ON ri2.recipe_id = r2.id
        JOIN ingredients i2 ON i2.id = ri2.ingredient_id
        WHERE r2.is_sub_recipe = true
        GROUP BY r2.id
    ) sr ON sr.sub_id = rs.subrecipe_id
    GROUP BY rs.recipe_id
) sub ON sub.recipe_id = r.id
                        join taxes t on t.id = p.tax_id 
						where p.restaurant_name = %s
"""
    product_categories_script = """SELECT * FROM product_categories WHERE restaurant_name = %s"""
    tableLayout_script = """SELECT tablelayout FROM customer_settings where restaurant_name = %s"""
    payment_methods_script = """SELECT * FROM payment_methods where restaurant_name = %s"""
    service_charges_script = """SELECT * FROM service_charges where restaurant_name = %s"""
    discounts_script = """SELECT * FROM discounts where restaurant_name = %s"""
    users_script = """SELECT * FROM users where restaurant_name = %s"""
    condiments_script = """SELECT * FROM combo_groups where restaurant_name = %s """
    cancel_return_script = """SELECT * FROM cancel_return_reasons where restaurant_name = %s"""
    values = (customer["restaurant"],)

    taxes = execute_query(taxes_script, values, True)
    products = execute_query(products_script, values, True)
    product_categories = execute_query(product_categories_script, values, True)
    table_layout = execute_query(tableLayout_script, values, True)
    payment_methods = execute_query(payment_methods_script, values, True)
    service_charges = execute_query(service_charges_script, values, True)
    discounts = execute_query(discounts_script, values, True)
    users = execute_query(users_script, values, True)
    condiments = execute_query(condiments_script, values, True)
    cancel_return = execute_query(cancel_return_script, values, True)
    data = {
        "taxes":taxes,
        "products": products,
        "product_categories": product_categories,
        "table_layout": table_layout,
        "payment_methods": payment_methods,
        "service_charges": service_charges,
        "discounts": discounts,
        "users": users,
        "condiments": condiments,
        "cancel_return": cancel_return
    }

    return data

