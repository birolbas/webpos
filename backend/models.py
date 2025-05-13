from config import db
from sqlalchemy.dialects.postgresql import JSONB  

class Orders(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_id = db.Column(db.String(50), nullable=False)
    orders = db.Column(JSONB, nullable=False)  
    total_price = db.Column(db.Float, nullable=False)
