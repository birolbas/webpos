from config import app, conn
from flask_bcrypt import Bcrypt
from flask import render_template, request, jsonify
from flask_cors import CORS
CORS(app)
bcrtpy = Bcrypt(app)

@app.route("/sign-up", methods = ["POST"])
def signUp():
    data = request.get_json()
    restaurant_name = data["restaurant_name"]
    print(restaurant_name)
    e_mail = data["e_mail"]
    hashed_password = bcrtpy.generate_password_hash(data["password"]).decode("utf-8")
    if_exist_check_script = """ select restaurant_name from customers """
    cur = conn.cursor()
    cur.execute(if_exist_check_script)
    is_exist = cur.fetchall()
    print(is_exist)
    if is_exist == []:
        insert_script = """ insert into customers (restaurant_name, e_mail, password_hash)
                            values (%s, %s, %s) """
        values = (restaurant_name, e_mail, hashed_password)
        cur.execute(insert_script, values)
        conn.commit()
        print("başarılı")
    else:
        return { "success": False }
    return { "success": True }

@app.route("/login", methods = ["POST"])
def login():
    data = request.get_json()
    print(data["password"])
    get_e_mail_script = """select e_mail, password_hash from customers where e_mail = %s """
    values = (data["e_mail"],)
    cur = conn.cursor()
    cur.execute(get_e_mail_script, values)
    e_mail_from_DB = cur.fetchall()
    pw_hash = e_mail_from_DB[0][1]
    if e_mail_from_DB == []:
        return {"success": False}
    else:
        is_true = bcrtpy.check_password_hash(pw_hash=pw_hash, password= data["password"])
        return {"success" :True}