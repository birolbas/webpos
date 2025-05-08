from flask import render_template, request, jsonify
from config import app, db
from models import Contact
import datetime as dt

@app.route("/")
def lobby():
    return render_template("login.html")

@app.route("/contacts")
def get_contacts():
    return jsonify({"contacts": [
        {"name": "Ali", "phone": "123456789"},
        {"name": "Ayşe", "phone": "987654321"}
    ]})

@app.route("/create_contact", methods=["POST"])
def create_contact():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")

    if not first_name or not last_name or not email:
        return jsonify({"message":"You must include a first name, nast name and email"}),
    400,

    new_contact = Contact(first_name = first_name, last_name=last_name, email = email)

    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        return({"message":str(e)}),400

    return jsonify({"message":"USER CREATED!"}),201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    contact = Contact.query.get(user_id)    

    if not contact:
        return jsonify({"message":"user not found"})

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.lastname_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)

    db.session.commit()

    return jsonify({"message":"USER UPDATED"})

@app.route("/delete_contact/<int:user_id>",methods = ["DELETE"])
def delete_contact(user_id):
    contact = Contact.query.get(user_id)    

    if not contact:
        return jsonify({"message":"user not found"})

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "USER DELETED"})



@app.route("/order")
def order():
    date = dt.datetime.now()
    formatted_date = date.strftime("%d %B %Y")
    formatted_time = date.strftime("%H:%M")
    day = date.strftime("%A")  
    return render_template("order.html", date = formatted_date, time = formatted_time, day=day)

@app.route("/tables")
def tables():
    date = dt.datetime.now()
    formatted_date = date.strftime("%d %B %Y")
    formatted_time = date.strftime("%H:%M")
    day = date.strftime("%A")  
    return render_template("tables.html", date = formatted_date, time = formatted_time, day=day)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()





    app.run(debug=True)