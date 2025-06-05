from flask import render_template, request, jsonify
from config import app, conn
import datetime as dt
import json
@app.route("/")
def lobby():
    return render_template("order.html")

#get table grid layout 
@app.route("/table_grid",  methods=["GET"])
def table_grid():
    get_data_script = """SELECT * FROM table_grid_pricing"""
    cur = conn.cursor()
    cur.execute(get_data_script)
    data = cur.fetchall()
    return data

#saving table-grid changes on settings
@app.route("/table_grid_save", methods=["POST"])
def tables():
    delete_script = """DELETE FROM table_grid_pricing"""
    append_script = """ INSERT INTO table_grid_pricing(floorname, gridrow, gridcol, floortables)
                        Values (%s, %s, %s, %s) """
    cur = conn.cursor()
    cur.execute(delete_script)
    data = request.get_json()
    for item in data:
        floorname = item["Name"]
        gridrow = item["gridRow"]
        gridCol = item["gridCol"]
        tables = json.dumps(item["tables"])
        values = (floorname, gridrow, gridCol, tables)
        cur.execute(append_script, values)
    conn.commit()
    return data

#send orders to database
@app.route("/orders" ,methods=["POST"])
def order():
    data = request.get_json()
    print("data is ",data)
    table_id = data["table_id"]
    orders = json.dumps(data["orders"])
    print(f"orders{orders} ")

    total_price = data["total_price"]
    print(f"TOTAL ORDERS YAZAN BU {table_id}")
    cur = conn.cursor()
    isCheckOpen_script = """SELECT table_id FROM orders where table_id =%s"""
    cur.execute(isCheckOpen_script, (table_id,))
    tablePricing_script = """UPDATE orders
                            SET total_price = %s
                            WHERE table_id = %s"""
    if cur.fetchall() == []:
        print("IF CALISTI") 
        order_save_script ="""
                            INSERT INTO ORDERS ( table_id, orders, total_price)
                            Values(%s,%s,%s)
                            """
        values = (table_id, orders,total_price)
        cur.execute(tablePricing_script, (total_price, table_id))
        cur.execute(order_save_script, values)
        conn.commit()

    else:
        print("ELSE CALIUSTI")
        order_save_script = """UPDATE orders 
                                SET ORDERS = %s, total_price = %s
                                WHERE table_id = %s"""
        values = (orders,total_price, table_id)
        cur.execute(order_save_script, values)
        conn.commit()


    return jsonify({"status":"success"}), 200

#get orders from database
@app.route("/get_orders", methods=["GET"])
def get_orders():
    orders_in_database = """ SELECT * FROM orders """
    cur = conn.cursor()
    cur.execute(orders_in_database)
    data = cur.fetchall()
    return data

#get products from database
@app.route("/get_products", methods=["GET"])
def get_products():
    get_products_script = """ SELECT * FROM PRODUCTS"""
    cur = conn.cursor()
    cur.execute(get_products_script)
    data = cur.fetchall()
    print(data)
    return data

#set products to database
@app.route("/set_products", methods=["POST"])
def set_products():
    
    data = request.get_json()
    restaurantName = data["restaurantName"]
    print(restaurantName)
    products = json.dumps(data["products"])
    print(products)
    cur = conn.cursor()
    try:
        set_products_script = """update  products
                                 SET products = %s::jsonb
                                 where  restaurantName = %s"""
        cur.execute(set_products_script, (products ,restaurantName))
        conn.commit()
    except KeyError:
        print("error")
    else:
        create_products = """INSERT INTO products
                             VALUES (%s, %s)                            
                                """
        cur.execute(create_products, (restaurantName, restaurantName))
        conn.commit()

    return data



if __name__ == "__main__":
    app.run(debug=True)