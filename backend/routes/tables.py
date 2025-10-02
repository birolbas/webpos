from database.config import app, get_db_connection, SERVER_CONFIG
from fastapi import Depends, APIRouter
from auth.jwt_handler import get_current_user
from database.queries import execute_query
router = APIRouter(tags=["orders"])

@router.get("/table_grid")
async def get_table_grid(customer = Depends(get_current_user)):
    """Get table grid layout"""
    restaurant = customer["restaurant"]
    get_data_script = """SELECT * FROM table_grid_pricing where restaurant_name = %s"""
    values = (restaurant,)
    data = execute_query(get_data_script, values, True)
    return data
"""make get open checks here"""