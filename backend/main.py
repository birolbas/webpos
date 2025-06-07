from flask import render_template, request, jsonify
from config import app, conn
import datetime as dt
import json
from datetime import datetime

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
    print(data)
    restaurant_name = data["restaurant_name"]
    table_id = data["table_id"]
    check_number = int(data["checkNumber"])
    openning_date = data["oppeningDate"]
    orders = json.dumps(data["orders"])
    total_price = data["total_price"]
    cur = conn.cursor()

    isCheckOpen_script = """SELECT table_id FROM open_checks where restaurant_name =%s AND table_id =%s AND restaurant_name =%s """
    cur.execute(isCheckOpen_script, (restaurant_name,table_id,restaurant_name))

    if cur.fetchall() == []:
        print("IF CALISTI") 
        order_save_script ="""INSERT INTO open_checks (restaurant_name, table_id, check_number, openningdate, products , total_price )
                                Values(%s,%s,%s,%s,%s,%s)"""
        values = (restaurant_name, table_id, check_number,openning_date, orders,total_price)
        cur.execute(order_save_script, values)
        conn.commit()

    else:
        print("ELSE CALIUSTI")
        order_save_script = """UPDATE open_checks 
                                SET products = %s, total_price = %s
                                WHERE table_id = %s AND restaurant_name = %s"""
        values = (orders,total_price, table_id, restaurant_name)
        cur.execute(order_save_script, values)
        conn.commit()


    return jsonify({"status":"success"}), 200

#get orders from database
@app.route("/get_orders", methods=["GET"])
def get_orders():
    orders_in_database = """ SELECT * FROM open_checks where restaurant_name =%s """
    restaurant_name = "TEST"
    cur = conn.cursor()
    cur.execute(orders_in_database,(restaurant_name,))
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
    print(f"data is{restaurantName} ")
    
    products = json.dumps(data["products"])
    print(products)
    cur = conn.cursor()
    try:
        set_products_script = """update  products
                                 SET products = %s::jsonb
                                 where  restaurantName = %s"""
        cur.execute(set_products_script, (products ,restaurantName))
        conn.commit()
    except:
        print("error")
    else:
        create_products = """INSERT INTO products
                             VALUES (%s, %s)                            
                            """
        cur.execute(create_products, (restaurantName, products))
        conn.commit()

    return data

#get payment orders from database
@app.route("/get_payment_orders/<table_id>", methods=["GET"])
def get_payment_orders(table_id):
    orders_in_database = """ SELECT * FROM open_checks where restaurant_name =%s AND table_id=%s """
    restaurant_name = "TEST"
    cur = conn.cursor()
    cur.execute(orders_in_database,(restaurant_name,table_id))
    data = cur.fetchall()
    print(data)
    return data

@app.route("/set_payments/<table_id>", methods=["POST"])
def set_payments(table_id):
    payments = request.get_json()
    payments = json.dumps(payments)

    orders_in_database = """ UPDATE  open_checks 
                            SET payments=%s
                            where restaurant_name = %s AND table_id =%s 
                            """
    restaurant_name = "TEST"
    cur = conn.cursor()
    cur.execute(orders_in_database,(payments,restaurant_name,table_id))
    conn.commit()
    return jsonify({"status":"success"}), 200

@app.route("/close_check/<table_id>", methods=["POST"])
def close_check(table_id):
    cur = conn.cursor()
    data = request.get_json()
    get_open_check = """SELECT * FROM open_checks WHERE table_id=%s"""
    cur.execute(get_open_check,(table_id,))
    data = cur.fetchall()
    id = data[0][0]
    restaurant_name = data[0][1]
    check_number = data[0][3]
    oppenningdate = data[0][4]
    products = json.dumps(data[0][5])
    total_price = data[0][6]
    payments = json.dumps(data[0][7])
    now = str(datetime.now().replace(microsecond=0))
    values = (id, restaurant_name, table_id, check_number, oppenningdate, products, total_price, payments,now)

    update_closed_check = """INSERT INTO closed_checks
                            values(%s,%s, %s, %s, %s, %s, %s, %s, %s)"""
    
    cur.execute(update_closed_check, values)
    
    delete_open_check = """DELETE FROM open_checks WHERE table_id=%s"""
    cur.execute(delete_open_check, (table_id,))
    conn.commit()
    return jsonify({"status":"success"}), 200

if __name__ == "__main__":
    app.run(debug=True) 