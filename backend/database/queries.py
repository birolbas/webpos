from database.config import get_db_connection
import psycopg2.extras
def execute_query(query, params=None, fetch=False):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            if fetch:
                return cur.fetchall()
            conn.commit()
    except Exception as error:
        raise error
    
