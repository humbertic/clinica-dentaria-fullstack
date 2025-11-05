from src.auditoria import models as auditoria_models
from src.auditoria.context import get_current_clinica_id


def registrar_auditoria(
    db,
    utilizador_id: int,
    acao: str,
    objeto: str,
    objeto_id: int = None,
    detalhes: str = None,
    clinica_id: int = None
):
    """
    Register an audit log entry.

    Args:
        db: Database session
        utilizador_id: ID of the user performing the action
        acao: Action being performed (e.g., "Criação", "Atualização", "Exclusão")
        objeto: Object type being affected (e.g., "Paciente", "Consulta")
        objeto_id: Optional ID of the specific object instance
        detalhes: Optional additional details about the action
        clinica_id: Optional explicit clinic ID. If not provided, will be retrieved
                   from request context. Use this when the clinic being affected
                   is different from the user's active clinic (e.g., creating a new clinic,
                   editing a different clinic).

    Note:
        The clinica_id is automatically retrieved from the request context
        set by the AuditoriaContextMiddleware based on the JWT token.
        You can override this by passing clinica_id explicitly for operations
        that affect a specific clinic (e.g., clinic creation/updates).

    Raises:
        ValueError: If clinica_id is not available in context or provided explicitly
    """
    # Use provided clinica_id or get from context (set by middleware)
    final_clinica_id = clinica_id if clinica_id is not None else get_current_clinica_id()

    # Special case: If creating a Clinica and no context clinica_id exists,
    # use the newly created clinic's ID (passed as objeto_id)
    if final_clinica_id is None and objeto == "Clinica" and acao == "Criação" and objeto_id is not None:
        final_clinica_id = objeto_id

    if final_clinica_id is None:
        raise ValueError(
            "clinica_id is required for audit logging but was not found in context "
            "and not provided explicitly. Ensure the request includes a valid JWT token "
            "with clinica_id, or pass clinica_id explicitly."
        )

    registro = auditoria_models.Auditoria(
        utilizador_id=utilizador_id,
        clinica_id=final_clinica_id,
        acao=acao,
        objeto=objeto,
        objeto_id=objeto_id,
        detalhes=detalhes
    )
    db.add(registro)
    db.commit()