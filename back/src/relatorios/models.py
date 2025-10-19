from sqlalchemy import Column, String, Integer, Date, Numeric, DateTime
from src.database import Base

# Define views manually to avoid autoload during startup
# These models represent database views - columns can be adjusted as needed

class RevenueSummary(Base):
    __tablename__ = "vw_revenue_summary"

    dia = Column(Date, primary_key=True)
    total_revenue = Column(Numeric)

class TopServices(Base):
    __tablename__ = "vw_top_services"

    servico = Column(String, primary_key=True)
    total_count = Column(Integer)

class CashShift(Base):
    __tablename__ = "vw_cash_shift"

    session_id = Column(Integer, primary_key=True)
    total_amount = Column(Numeric)

class OverdueInstallment(Base):
    __tablename__ = "vw_overdue_installments"

    parcela_id = Column(Integer, primary_key=True)
    amount = Column(Numeric)

class StockCritical(Base):
    __tablename__ = "vw_stock_critical"

    id = Column(Integer, primary_key=True)
    item_name = Column(String)

class ProductivityClinical(Base):
    __tablename__ = "vw_productivity_clinical"

    mes = Column(Date, primary_key=True)
    medico_id = Column(Integer, primary_key=True)
    productivity = Column(Numeric)