from database.config import app, get_db_connection, SERVER_CONFIG
from fastapi import Depends, APIRouter, Request
from auth.jwt_handler import get_current_user
from database.queries import execute_query
router = APIRouter(tags=["orders"])

@router.post("/income")
async def get_income(request : Request, customer = Depends(get_current_user)):
    """Get income data"""    
    day_data = await request.json()
    if isinstance(day_data, str) and len(day_data) == 10:
        values = (day_data, day_data,"TEST", day_data, day_data, "TEST")
        payment_values = (day_data ,day_data,"TEST")
    else:
        day_range = day_data if isinstance(day_data, list) else [day_data]
        values = (day_range[0], day_range[1], "TEST", day_range[0], day_range[1], "TEST")
        payment_values = (day_range[0], day_range[1], "TEST")

    income_script = """
                    SELECT 
                        SUM(totalMoney) AS totalMoney,
                        SUM(guestCount) AS guestCount,
                        SUM(serviceCharge) AS totalServiceCharge,
                        SUM(totalDiscount) AS totalDiscount,
                        SUM(taxes) AS totalTaxes,
                        SUM(net) AS totalNet,
                        SUM(check_count) as totalCheckCount
                    FROM (
                        SELECT 
                            SUM(total_price) AS totalMoney,
                            SUM(guest_count) AS guestCount,
                            SUM(total_service_charge) AS serviceCharge,
                            SUM(total_discount) AS totalDiscount,
                            SUM(tax_total) AS taxes,
                            SUM(total_price - tax_total) AS net,
                            COUNT(*) AS check_count
                        FROM closed_checks
                        WHERE closing_date >= %s AND closing_date <= %s AND restaurant_name = %s
                        UNION ALL
                        SELECT
                            SUM(total_price) AS totalMoney,
                            SUM(guest_count) AS guestCount,
                            SUM(total_service_charge) AS serviceCharge,
                            SUM(total_discount) AS totalDiscount,
                            SUM(tax_total) AS taxes,
                            SUM(total_price - tax_total) AS net,
                            COUNT(*) AS check_count
                        FROM open_checks
                            WHERE openningdate >= %s AND openningdate <= %s AND restaurant_name = %s
                    )
                    """
    
    payment_script = """
                    SELECT p->>'paymentName' AS name, 
                        SUM((p->>'payedPrice')::numeric) 
                        AS total_method_money, 
                        (p->>'isIncludedIncome')::boolean as includedIncome 
                        FROM closed_checks, jsonb_array_elements(payments) AS p 
                        WHERE closing_date >= %s AND closing_date <= %s AND restaurant_name = %s
                    GROUP BY name, includedIncome;
                                    """
    busiestHours_script = """SELECT 
                                EXTRACT(HOUR FROM openningtime::time) AS hour,
                                SUM((p->>'payedPrice')::numeric) AS total_method_money,
                                SUM(guest_count) AS total_guest_count,
                                COUNT(*) AS total_check_count
                                FROM closed_checks,
                                jsonb_array_elements(payments) AS p
                                WHERE (p->>'isIncludedIncome') = 'true' AND closing_date >= %s AND closing_date <= %s AND restaurant_name = %s
                                GROUP BY hour
                            ORDER BY total_method_money DESC ;
                        """
         
    check_info = execute_query(income_script, values, True)
    payments = execute_query(payment_script, payment_values, True)
    busiest_hours = execute_query(busiestHours_script, payment_values, True)
    data = {
        "check_info": check_info,
        "payments": payments,
        "busiest_hours": busiest_hours
    }
    print(data)
    return data



