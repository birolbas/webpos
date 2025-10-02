from database.config import app,SERVER_CONFIG
from routes import orders, tables, customerSettings, income, payment, closedChecks
from auth import routes as auth_routes


# Routers register
app.include_router(auth_routes.router)
app.include_router(orders.router)
app.include_router(tables.router)
app.include_router(customerSettings.router)
app.include_router(payment.router)
app.include_router(income.router)
app.include_router(closedChecks.router)

@app.get("/")
async def lobby():
    return {"message": "Restaurant Management System API", "docs": "/docs"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # module_name:variable_name
        host=SERVER_CONFIG["host"], 
        port=SERVER_CONFIG["port"], 
        reload=SERVER_CONFIG["reload"]
    )