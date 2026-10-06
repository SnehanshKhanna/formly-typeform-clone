from sqlalchemy import Column, String

from app.db.base import BaseModel


class Creator(BaseModel):
    __tablename__ = "creators"

    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
