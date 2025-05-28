from flask import render_template, request, jsonify
from config import app, conn
import datetime as dt
import json
@app.route("/")
def lobby():
    return render_template("ordernnnnnnnnnnnnnnn.html")

@app.route("/tables", methods=["GET"])
def tables():
    tables_in_db = """SELECT * FROM table_grid_pricing"""
    cur = conn.cursor()
    cur.execute(tables_in_db)
    data = cur.fetchall()
    return data

@app.route("/orders" ,methods=["POST"])
def order():
    data = request.get_json()
    print(data)
    table_id = data["table_id"]
    orders = json.dumps(data["orders"])
    total_price = data["total_price"]
    print(f"TOTAL ORDERS YAZAN BU {total_price}")
    cur = conn.cursor()
    isCheckOpen_script = """SELECT table_id FROM orders where table_id =%s"""
    cur.execute(isCheckOpen_script, (table_id,))
    tablePricing_script = """UPDATE table_pricing
                            SET table_price = %s
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
        cur.execute(tablePricing_script, (total_price, table_id))
        values = (orders,total_price, table_id)
        cur.execute(order_save_script, values)
        conn.commit()


    return data

@app.route("/get_orders", methods=["GET"])
def get_orders():
    orders_in_database = """ SELECT * FROM ORDERS """
    cur = conn.cursor()
    cur.execute(orders_in_database)
    data = (cur.fetchall())
    return data


if __name__ == "__main__":
    app.run(debug=True)