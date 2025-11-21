"""
Scheduler para envio automático de alertas de stock.
Executa diariamente às 8h da manhã para todas as clínicas ativas.
"""

import asyncio
import logging
from datetime import datetime
from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session

from src.database import SessionLocal
from src.clinica.models import Clinica
from src.clinica.service import get_alert_settings
from src.stock.service import verificar_alertas_stock
from src.email.service import EmailManager
from src.email.util import get_email_config

logger = logging.getLogger(__name__)

# Scheduler global
scheduler = None


async def enviar_alertas_todas_clinicas():
    """
    Verifica e envia alertas de stock para todas as clínicas ativas.
    Chamada automaticamente pelo scheduler.
    """
    db: Session = SessionLocal()
    try:
        # Buscar todas as clínicas ativas
        clinicas: List[Clinica] = db.query(Clinica).filter(Clinica.ativo == True).all()

        logger.info(f"🔔 Iniciando verificação de alertas de stock para {len(clinicas)} clínica(s)")

        total_alertas_enviados = 0

        for clinica in clinicas:
            try:
                # Get alert settings for this clinic using existing configuration keys
                alert_settings = get_alert_settings(db, clinica.id)

                # Check individual notification settings
                notificar_baixo_estoque = alert_settings["notificar_email_baixo_estoque"]
                notificar_vencimento = alert_settings["notificar_email_vencimento"]

                # Skip if both notifications are disabled
                if not notificar_baixo_estoque and not notificar_vencimento:
                    logger.info(f"  ℹ️  Clínica '{clinica.nome}' (ID: {clinica.id}): Notificações desativadas")
                    continue

                # Use configured days for expiry check (alerta_data_vencimento)
                dias_expiracao = alert_settings["alerta_data_vencimento"]

                # Verificar alertas para esta clínica (uses quantidade_minima from ItemStock)
                alertas = verificar_alertas_stock(db, clinica.id, dias_expiracao=dias_expiracao)

                itens_baixo_stock = alertas["itens_baixo_stock"] if notificar_baixo_estoque else []
                itens_expirando = alertas["itens_expirando"] if notificar_vencimento else []

                # Se não há alertas para enviar, pular
                if not itens_baixo_stock and not itens_expirando:
                    logger.info(f"  ℹ️  Clínica '{clinica.nome}' (ID: {clinica.id}): Sem alertas")
                    continue

                # Configurar e enviar email
                config = await get_email_config(clinica.id, db)
                email_manager = EmailManager(db, config)

                await email_manager.enviar_alertas_stock(
                    clinica_id=clinica.id,
                    itens_baixo_stock=itens_baixo_stock,
                    itens_expirando=itens_expirando
                )

                total_alertas = len(itens_baixo_stock) + len(itens_expirando)
                total_alertas_enviados += total_alertas

                logger.info(
                    f"  ✅ Clínica '{clinica.nome}' (ID: {clinica.id}): "
                    f"{total_alertas} alerta(s) enviado(s) "
                    f"({len(itens_baixo_stock)} stock baixo, {len(itens_expirando)} a expirar)"
                )

            except Exception as e:
                logger.error(
                    f"  ❌ Erro ao processar alertas para clínica '{clinica.nome}' (ID: {clinica.id}): {e}",
                    exc_info=True
                )
                continue

        logger.info(f"🔔 Verificação concluída. Total de {total_alertas_enviados} alerta(s) enviado(s)")

    except Exception as e:
        logger.error(f"❌ Erro ao executar verificação de alertas: {e}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    """
    Inicia o scheduler de alertas de stock.
    Deve ser chamado no startup da aplicação FastAPI.
    """
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler já está em execução")
        return

    scheduler = AsyncIOScheduler()

    # Agendar para executar todos os dias às 8h da manhã
    trigger = CronTrigger(
        hour=8,
        minute=0,
        timezone="Europe/Lisbon"  # Ajustar para o timezone da clínica
    )

    scheduler.add_job(
        enviar_alertas_todas_clinicas,
        trigger=trigger,
        id="stock_alerts_daily",
        name="Alertas de Stock Diários",
        replace_existing=True
    )

    scheduler.start()
    logger.info("📅 Scheduler de alertas de stock iniciado (execução diária às 08:00)")


def stop_scheduler():
    """
    Para o scheduler de alertas de stock.
    Deve ser chamado no shutdown da aplicação FastAPI.
    """
    global scheduler

    if scheduler is not None:
        scheduler.shutdown(wait=False)
        scheduler = None
        logger.info("📅 Scheduler de alertas de stock parado")


def run_now():
    """
    Executa a verificação de alertas imediatamente (útil para testes).
    """
    asyncio.create_task(enviar_alertas_todas_clinicas())
    logger.info("🔔 Verificação manual de alertas iniciada")
