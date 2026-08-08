from pydantic import BaseModel


class MessageOut(BaseModel):
    message: str


class ErrorOut(BaseModel):
    error: str
