from pydantic import BaseModel


class HEXColor(BaseModel):
    hex_: str

    def __str__(self) -> str:
        return self.hex_.upper()