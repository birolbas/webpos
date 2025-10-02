from database.config import app, get_db_connection, SERVER_CONFIG
from fastapi import Depends, APIRouter, Request
from auth.jwt_handler import get_current_user
from database.queries import execute_query
router = APIRouter(tags=["orders"])

@router.post("/income")
async def get_income(request : Request, customer = Depends(get_current_user)):
    """Get income data"""    
    day_data = await request.json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if isinstance(day_data, str) and len(day_data) == 10:
                #single day query
                single_day_income_script = """
                    SELECT restaurant_name, table_id, openningdate, products, total_price, 
                           payments, closing_date, guest_count, openningtime, checkdiscounts, total_discount, total_service_charge, checkservicecharges, tax_total
                    FROM closed_checks
                    WHERE closing_date = %s
                    UNION ALL
                    SELECT restaurant_name, table_id, openningdate, products, total_price, 
                           payments, NULL AS closing_date, guest_count, openningtime, checkdiscounts, total_discount, total_service_charge, checkservicecharges, tax_total
                    FROM open_checks
                    WHERE openningdate = %s
                """
                values = (day_data, day_data)
            else:
                #date range query
                day_range = day_data if isinstance(day_data, list) else [day_data]
                if len(day_range) >= 2:
                    single_day_income_script = """
                        SELECT restaurant_name, table_id, openningdate, products, total_price, 
                               payments, closing_date, guest_count, openningtime, checkdiscounts, total_discount, total_service_charge, checkservicecharges, tax_total
                        FROM closed_checks
                        WHERE closing_date > %s AND closing_date <= %s
                        UNION ALL
                        SELECT restaurant_name, table_id, openningdate, products, total_price, 
                               payments, NULL AS closing_date, guest_count, openningtime, checkdiscounts, total_discount, total_service_charge, checkservicecharges, tax_total
                        FROM open_checks
                        WHERE openningdate > %s AND openningdate <= %s
                    """
                    values = (day_range[0], day_range[1], day_range[0], day_range[1])
                else:
                    raise HTTPException(status_code=400, detail="Invalid date range")
            
            cur.execute(single_day_income_script, values)
            data = cur.fetchall()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()


