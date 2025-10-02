from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from typing import Optional

app = FastAPI(title="Restaurant Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_CONFIG = {
    "host": "localhost",
    "dbname": "restowebpos", 
    "user": "postgres",
    "password": "1",
    "port": 5432,
    "options": "-c client_encoding=utf8"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        conn.set_client_encoding('UTF8')
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        raise
    except UnicodeDecodeError as e:
        print(f"Encoding error: {e}")
        try:
            basic_config = {
                "host": DATABASE_CONFIG["host"],
                "dbname": DATABASE_CONFIG["dbname"],
                "user": DATABASE_CONFIG["user"],
                "password": DATABASE_CONFIG["password"],
                "port": DATABASE_CONFIG["port"]
            }
            conn = psycopg2.connect(**basic_config)
            return conn
        except Exception as fallback_error:
            print(f"Fallback connection also failed: {fallback_error}")
            raise

conn = get_db_connection()

SERVER_CONFIG = {
    "host": "127.0.0.1",
    "port": 5000,
    "reload": True
}