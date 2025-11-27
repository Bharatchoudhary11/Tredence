from fastapi import APIRouter

from app.schemas.autocomplete import AutocompleteRequest, AutocompleteResponse
from app.services.autocomplete import generate_suggestion

router = APIRouter(prefix="/autocomplete", tags=["autocomplete"])


@router.post("", response_model=AutocompleteResponse)
async def autocomplete(payload: AutocompleteRequest) -> AutocompleteResponse:
    suggestion = generate_suggestion(
        code=payload.code,
        cursor_position=payload.cursorPosition,
        language=payload.language,
    )
    return AutocompleteResponse(suggestion=suggestion)
