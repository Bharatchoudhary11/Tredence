import re


PY_HINTS = {
    "def": "def new_function():\n    pass",
    "for": "for i in range(10):\n    print(i)",
    "if": "if condition:\n    pass",
}


def generate_suggestion(code: str, cursor_position: int, language: str) -> str:
    """Return a deterministic mocked suggestion for the editor."""
    if language.lower() != "python":
        return "print('Hello from Tradance AI!')"

    before_cursor = code[:cursor_position]
    token = re.split(r"\\s", before_cursor.strip())[-1] if before_cursor.strip() else ""
    for key, suggestion in PY_HINTS.items():
        if token.startswith(key):
            return suggestion
    if "class " in before_cursor:
        return "class Example:\n    def __init__(self):\n        self.value = 0"
    return "print('Happy pairing!')"
