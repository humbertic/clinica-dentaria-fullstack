"""
Context management for auditoria (audit logging).

This module uses Python's contextvars to store request-scoped data
that needs to be accessible throughout the request lifecycle without
explicitly passing it through every function call.

The context is automatically set by middleware based on the JWT token.
"""

from contextvars import ContextVar
from typing import Optional

# Context variable to store the current clinic ID for the request
current_clinica_id: ContextVar[Optional[int]] = ContextVar('current_clinica_id', default=None)


def get_current_clinica_id() -> Optional[int]:
    """
    Get the clinic ID from the current request context.

    Returns:
        The clinic ID if set, None otherwise.
    """
    return current_clinica_id.get()


def set_current_clinica_id(clinica_id: int) -> None:
    """
    Set the clinic ID for the current request context.

    Args:
        clinica_id: The ID of the clinic to set in context.
    """
    current_clinica_id.set(clinica_id)


def clear_current_clinica_id() -> None:
    """
    Clear the clinic ID from the current request context.
    Useful for cleanup or testing purposes.
    """
    current_clinica_id.set(None)
