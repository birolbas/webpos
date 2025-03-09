from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route("/")
def lobby():
    return render_template("lobby.html")

@app.route("/ciro")
def lobby():
    return print("hello")

if __name__ == "__main__":
    app.run(debug=True)