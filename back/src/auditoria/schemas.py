from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum

class AuditoriaResponse(BaseModel):
    id: int
    utilizador_id: int
    utilizador_nome: str | None = None
    clinica_id: int
    clinica_nome: str | None = None
    acao: str
    objeto: str
    objeto_id: int | None = None
    objeto_nome: str | None = None
    detalhes: str | None = None
    data: datetime

    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int

class AuditoriaPaginatedResponse(BaseModel):
    items: List[AuditoriaResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class UtilizadorFilter(BaseModel):
    id: int
    nome: str

class AuditoriaMetadata(BaseModel):
    acoes: List[str]
    objetos: List[str]
    utilizadores: List[UtilizadorFilter]

class ExportFormat(str, Enum):
    EXCEL = "excel"
    PDF = "pdf"

class ExportRequest(BaseModel):
    format: ExportFormat
    filters: Optional[dict] = None
    selected_ids: Optional[List[int]] = None
    export_all: bool = False

class ExportResponse(BaseModel):
    filename: str
    content_type: str
    message: str = "Export completed successfully"