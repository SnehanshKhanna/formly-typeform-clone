from app.question_types.choices import RatingHandler, YesNoHandler
from app.question_types.email_number import EmailHandler, NumberHandler
from app.question_types.registry import register_handler
from app.question_types.text import LongTextHandler, ShortTextHandler

register_handler("short_text", ShortTextHandler)
register_handler("long_text", LongTextHandler)
register_handler("email", EmailHandler)
register_handler("number", NumberHandler)
register_handler("yes_no", YesNoHandler)
register_handler("rating", RatingHandler)
from app.question_types.multiple_choice import DropdownHandler, MultipleChoiceHandler

register_handler("multiple_choice", MultipleChoiceHandler)
register_handler("dropdown", DropdownHandler)
