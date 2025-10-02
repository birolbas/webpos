from database.queries import execute_query
from fastapi import APIRouter, Depends, Request
from auth.jwt_handler import get_current_user
from datetime import datetime
router = APIRouter(tags=["orders"])

@router.post("/closed_checks")
async def closed_checks(request: Request, customer = Depends(get_current_user)):
    date = await request.json()
    script = """SELECT * FROM closed_checks where restaurant_name = %s AND closing_date >= %s AND closing_date <= %s"""
    values = (customer["restaurant"], date["startingDate"],date["endingDate"])
    data = execute_query(script, values, True)
    print("data",data)
    return data

@router.delete("/delete_closed_check")
async def delete_closed_check(request: Request ,customer = Depends(get_current_user)):
    body = await request.json()
    script = """DELETE FROM closed_checks where restaurant_name= %s AND closing_date = %s AND id = %s AND table_id = %s"""
    values = (customer["restaurant"], body["deleteCheckDate"], body["deleteCheckId"], body["deleteCheckTableId"])
    data = execute_query(script, values)
    return data

@router.post("/reopen_closed_check")
async def closed_checks(request: Request, customer = Depends(get_current_user)):
    body = await request.json()
    print(body)
    getOpenCheckScript = """SELECT * FROM open_checks where restaurant_name = %s AND  table_id = %s"""
    getOpenCheckValues = (customer["restaurant"], body["reOpenCheckTableId"] )
    fetchData = execute_query(getOpenCheckScript, getOpenCheckValues, True)
    if fetchData == []:
        reOpenScript = """WITH moved_orders AS (
                            DELETE FROM closed_checks
                            WHERE id = %s 
                            RETURNING *
                        )
                        INSERT INTO open_checks (id, restaurant_name, table_id, check_number, openningdate, products, 
                                                total_price, guest_count, openningtime, checkdiscounts, total_discount, 
                                                total_service_charge, checkservicecharges, tax_total)
                        SELECT 
                            id,
                            restaurant_name,
                            table_id,
                            check_number,
                            openningdate,
                            products, 
                            total_price, 
                            guest_count, 
                            openningtime,
                            checkdiscounts,
                            total_discount,
                            total_service_charge,
                            checkservicecharges,
                            tax_total
                        FROM moved_orders;"""
        reOpenValues = (body["reOpenCheckId"],)
        execute_query(reOpenScript, reOpenValues)
        return {"status": "success"}
    else: 
        return {"status": "unsuccessful"}