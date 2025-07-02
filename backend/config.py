from flask import Flask
from flask_cors import CORS
import psycopg2
app = Flask(__name__)
CORS(app)  

conn = psycopg2.connect(
    host="localhost",
    dbname="restowebpos",
    user="postgres",
    password="1",
    port=5432,
)

