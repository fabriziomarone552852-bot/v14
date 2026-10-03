from pydantic import BaseModel, ConfigDict
from typing import Optional

class U(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    viewing_platform_name: Optional[str] = None

class T(BaseModel):
    logs: list[U]

t = T(logs=[{"id": 1, "viewing_platform_name": "Netflix"}])
print(t.model_dump())
