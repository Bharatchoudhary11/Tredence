import re


PY_HINTS = {
    "def": "def new_function():\n    pass",
    "async": "async def handler(request):\n    return {'status': 'ok'}",
    "for": "for i in range(10):\n    print(i)",
    "if": "if condition:\n    pass",
    "while": "while condition:\n    break",
    "try": "try:\n    risky_call()\nexcept Exception as exc:\n    print(exc)",
    "with": "with open('data.txt') as fp:\n    content = fp.read()",
    "import": "import pathlib\npath = pathlib.Path('.')",
    "from": "from dataclasses import dataclass\n@dataclass\nclass Example:\n    value: int",
    "print": "print('✨ Powered by Tradance AI')",
}


def generate_suggestion(code: str, cursor_position: int, language: str) -> str:
    """Return a deterministic mocked suggestion for the editor."""
    if language.lower() != "python":
        return "print('Hello from Tradance AI!')"

    before_cursor = code[:cursor_position]
    stripped = before_cursor.strip()
    token = re.split(r"\s+", stripped)[-1] if stripped else ""

    for key, suggestion in PY_HINTS.items():
        if token.startswith(key):
            return suggestion

    last_line = before_cursor.splitlines()[-1].strip() if before_cursor else ""
    if "class " in before_cursor:
        return "class Example:\n    def __init__(self):\n        self.value = 0"
    if last_line.endswith(":"):
        return "    pass"
    if last_line.endswith("("):
        return '    "value")'

    return "print('Happy pairing!')"
