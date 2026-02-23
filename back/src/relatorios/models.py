from sqlalchemy import Column, String, Integer, Date, Numeric, DateTime, BigInteger
from src.database import Base

# Define views manually to avoid autoload during startup
# These models represent database views - columns can be adjusted as needed

class RevenueSummary(Base):
    __tablename__ = "vw_revenue_summary"

    dia = Column(DateTime, primary_key=True)
    faturacao_total = Column(Numeric)
    receita_recebida = Column(Numeric)
    faturas_emitidas = Column(BigInteger)
    pagamentos_realizados = Column(BigInteger)

class TopServices(Base):
    __tablename__ = "vw_top_services"

    servico = Column(String, primary_key=True)
    valor_total = Column(Integer)

class CashShift(Base):
    __tablename__ = "vw_cash_shift"

    session_id = Column(Integer, primary_key=True)
    operador_id = Column(Integer)
    data_inicio = Column(DateTime)
    data_fecho = Column(DateTime)
    valor_inicial = Column(Numeric)
    total_entradas = Column(Numeric)
    valor_final = Column(Numeric)
    diferenca_teorica_real = Column(Numeric)

class OverdueInstallment(Base):
    __tablename__ = "vw_overdue_installments"

    parcela_id = Column(Integer, primary_key=True)
    fatura_id = Column(Integer)
    numero = Column(Integer)
    valor_em_divida = Column(Numeric)
    data_vencimento = Column(Date)
    dias_em_atraso = Column(Integer)

class StockCritical(Base):
    __tablename__ = "vw_stock_critical"

    id = Column(Integer, primary_key=True)
    nome = Column(String)
    quantidade_atual = Column(Numeric)
    quantidade_minima = Column(Numeric)
    validade_proxima = Column(Date)

class ProductivityClinical(Base):
    __tablename__ = "vw_productivity_clinical"

    mes = Column(Date, primary_key=True)
    medico_id = Column(Integer, primary_key=True)
    productivity = Column(Numeric)