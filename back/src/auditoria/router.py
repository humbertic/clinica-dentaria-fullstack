from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import Response
from sqlalchemy.orm import Session
from src.auditoria import service, schemas
from src.database import SessionLocal
from src.utilizadores.dependencies import get_current_user, get_current_user_with_clinic
from src.utilizadores.utils import is_master_admin
from src.pdf.service import render_template, generate_pdf
from src.clinica.service import get_clinica_details
from datetime import datetime
from typing import Optional, List
from pathlib import Path

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=schemas.AuditoriaPaginatedResponse)
def listar_auditoria(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    utilizador_id: Optional[int] = Query(None, description="Filter by user ID"),
    acao: Optional[str] = Query(None, description="Filter by action type"),
    objeto: Optional[str] = Query(None, description="Filter by object type"),
    data_inicio: Optional[datetime] = Query(None, description="Filter by start date"),
    data_fim: Optional[datetime] = Query(None, description="Filter by end date"),
    search: Optional[str] = Query(None, description="Search in details, action, or object"),
    clinica_id: Optional[int] = Query(None, description="Override clinic ID (master admin only)"),
    db: Session = Depends(get_db),
    user_clinic = Depends(get_current_user_with_clinic)
):
    utilizador_atual, active_clinic_id = user_clinic

    if not is_master_admin(utilizador_atual):
        raise HTTPException(status_code=403, detail="Apenas o Master Admin pode consultar auditoria.")

    # Master admin can override clinic, otherwise use their active clinic
    target_clinic_id = clinica_id if clinica_id is not None else active_clinic_id

    if target_clinic_id is None:
        raise HTTPException(status_code=400, detail="Nenhuma clínica ativa encontrada.")

    return service.listar_auditoria(
        db=db,
        clinica_id=target_clinic_id,
        skip=skip,
        limit=limit,
        utilizador_id=utilizador_id,
        acao=acao,
        objeto=objeto,
        data_inicio=data_inicio,
        data_fim=data_fim,
        search=search
    )

@router.get("/metadata", response_model=schemas.AuditoriaMetadata)
def get_metadata(
    clinica_id: Optional[int] = Query(None, description="Override clinic ID (master admin only)"),
    db: Session = Depends(get_db),
    user_clinic = Depends(get_current_user_with_clinic)
):
    utilizador_atual, active_clinic_id = user_clinic

    if not is_master_admin(utilizador_atual):
        raise HTTPException(status_code=403, detail="Apenas o Master Admin pode consultar metadados de auditoria.")

    # Master admin can override clinic, otherwise use their active clinic
    target_clinic_id = clinica_id if clinica_id is not None else active_clinic_id

    if target_clinic_id is None:
        raise HTTPException(status_code=400, detail="Nenhuma clínica ativa encontrada.")

    return service.get_auditoria_metadata(db=db, clinica_id=target_clinic_id)

@router.post("/export")
def export_auditoria(
    request: schemas.ExportRequest = Body(...),
    clinica_id: Optional[int] = Query(None, description="Override clinic ID (master admin only)"),
    db: Session = Depends(get_db),
    user_clinic = Depends(get_current_user_with_clinic)
):
    utilizador_atual, active_clinic_id = user_clinic

    if not is_master_admin(utilizador_atual):
        raise HTTPException(status_code=403, detail="Apenas o Master Admin pode exportar auditoria.")

    # Master admin can override clinic, otherwise use their active clinic
    target_clinic_id = clinica_id if clinica_id is not None else active_clinic_id

    if target_clinic_id is None:
        raise HTTPException(status_code=400, detail="Nenhuma clínica ativa encontrada.")

    try:
        if request.format == schemas.ExportFormat.EXCEL:
            # Export to Excel
            excel_data = service.export_auditoria_excel(
                db=db,
                clinica_id=target_clinic_id,
                filters=request.filters,
                selected_ids=request.selected_ids,
                export_all=request.export_all
            )

            filename = f"auditoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

            return Response(
                content=excel_data,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        elif request.format == schemas.ExportFormat.PDF:
            # Get data for PDF
            records = service.get_auditoria_for_pdf(
                db=db,
                clinica_id=target_clinic_id,
                filters=request.filters,
                selected_ids=request.selected_ids,
                export_all=request.export_all
            )

            # Get clinic details for PDF header
            clinica = get_clinica_details(db)

            # Prepare context for PDF template
            context = {
                "clinica": clinica,
                "records": records,
                "total_records": len(records),
                "data_geracao": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "filters_applied": request.filters or {},
                "logo_path": str(Path(__file__).parent.parent / "pdf" / "templates" / "assets" / "logo.png")
                if (Path(__file__).parent.parent / "pdf" / "templates" / "assets" / "logo.png").exists()
                else None,
            }

            # Generate PDF
            html = render_template("auditoria.html", context)
            pdf_data = generate_pdf(html, css_files=["styles.css"])

            filename = f"auditoria_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

            return Response(
                content=pdf_data,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        else:
            raise HTTPException(status_code=400, detail="Formato de exportação não suportado")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar dados: {str(e)}")