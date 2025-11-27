from pydantic import BaseModel, Field


class AutocompleteRequest(BaseModel):
    code: str = Field("", description="Current contents of the editor.")
    cursorPosition: int = Field(0, ge=0, description="Zero-based cursor index.")
    language: str = Field("python", description="Language hint.")


class AutocompleteResponse(BaseModel):
    suggestion: str
