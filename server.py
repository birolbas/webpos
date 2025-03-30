from flask import Flask, render_template, url_for
import datetime as dt
app = Flask(__name__)


@app.route("/")
def lobby():
    return render_template("login.html")
@app.route("/order")
def order():
    date = dt.datetime.now()
    formatted_date = date.strftime("%d %B %Y")
    formatted_time = date.strftime("%H:%M")
    day = date.strftime("%A")  
    return render_template("order.html", date = formatted_date, time = formatted_time, day=day)


if __name__ == "__main__":
    app.run(debug=True)