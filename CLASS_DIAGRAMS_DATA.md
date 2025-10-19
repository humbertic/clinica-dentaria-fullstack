# Class Diagrams Data - Clínica Dentária System

This document contains all the detailed information about the SQLAlchemy models organized by modules for creating class diagrams.

## 1. Módulo de Utilizadores e Autenticação ✅

### Utilizador
```python
class Utilizador(Base):
    __tablename__ = "Utilizador"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Unique Fields
    username: String(50) (Unique, Not Null)
    email: String(100) (Unique, Not Null)  
    telefone: String(20) (Unique, Not Null)
    
    # Basic Fields
    nome: String(100) (Not Null)
    password_hash: Text (Not Null)
    ativo: Boolean (Default=True)
    tentativas_falhadas: Integer (Default=0)
    bloqueado: Boolean (Default=False)
    
    # Relationships
    perfis: One-to-Many -> UtilizadorClinica
    sessoes: One-to-Many -> Sessao
```

### UtilizadorClinica (Association Table)
```python
class UtilizadorClinica(Base):
    __tablename__ = "UtilizadorClinica"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    utilizador_id: Integer -> Utilizador.id
    clinica_id: Integer -> Clinica.id
    perfil_id: Integer -> Perfil.id
    
    # Fields
    ativo: Boolean (Default=True)
    
    # Relationships
    utilizador: Many-to-One -> Utilizador
    perfil: Many-to-One -> Perfil
    clinica: Many-to-One -> Clinica
```

### Sessao
```python
class Sessao(Base):
    __tablename__ = "Sessao"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    utilizador_id: Integer -> Utilizador.id
    clinica_id: Integer -> Clinica.id
    
    # Fields
    token: Text (Not Null)
    data_expiracao: TIMESTAMP
    ativo: Boolean (Default=True)
    
    # Relationships
    utilizador: Many-to-One -> Utilizador
    clinica: Many-to-One -> Clinica
```

### Perfil
```python
class Perfil(Base):
    __tablename__ = "Perfil"
    
    # Primary Key
    id: Integer (PK)
    
    # Unique Fields
    perfil: String(50) (Unique, Not Null)
    nome: String(50) (Unique, Not Null)
```

### Auditoria
```python
class Auditoria(Base):
    __tablename__ = "Auditoria"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    utilizador_id: Integer -> Utilizador.id
    
    # Fields
    acao: String(100) (Not Null) # Ex: "Atualização", "Criação", "Login"
    objeto: String(100) (Not Null) # Ex: "Utilizador", "Perfil", "Sessao"
    objeto_id: Integer (Nullable) # ID do objeto afetado
    detalhes: String(255) # Texto livre
    data: DateTime (Default=utcnow)
    
    # Relationships
    utilizador: Many-to-One -> Utilizador
```

## 2. Módulo de Clínica ✅

### Clinica
```python
class Clinica(Base):
    __tablename__ = "Clinica"
    
    # Primary Key
    id: Integer (PK)
    
    # Fields
    nome: String(100) (Not Null)
    email_envio: String(100)
    morada: Text
    partilha_dados: Boolean (Default=False)
    
    # Self-referencing Foreign Key (Hierarchy)
    clinica_pai_id: Integer -> Clinica.id (Nullable)
    criado_por_id: Integer -> Utilizador.id (Nullable)
    
    # Relationships
    clinica_pai: Many-to-One -> Clinica (Self-reference)
    clinicas_filhas: One-to-Many -> Clinica (Self-reference, Cascade)
    configuracoes: One-to-Many -> ClinicaConfiguracao
    emails: One-to-Many -> ClinicaEmail
```

### ClinicaConfiguracao
```python
class ClinicaConfiguracao(Base):
    __tablename__ = "ClinicaConfiguracao"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    clinica_id: Integer -> Clinica.id
    
    # Fields
    chave: String(100) (Not Null)
    valor: Text (Not Null)
    
    # Constraints
    __table_args__ = UniqueConstraint('clinica_id', 'chave')
    
    # Relationships
    clinica: Many-to-One -> Clinica
```

### ClinicaEmail
```python
class ClinicaEmail(Base):
    __tablename__ = "ClinicaEmail"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    clinica_id: Integer -> Clinica.id
    
    # SMTP Configuration Fields
    remetente: String(100)
    nome_remetente: String(100)
    smtp_host: String(100)
    smtp_porta: Integer
    utilizador_smtp: String(100)
    password_smtp: Text
    usar_tls: Boolean (Default=True)
    usar_ssl: Boolean (Default=False)
    ativo: Boolean (Default=True)
    
    # Relationships
    clinica: Many-to-One -> Clinica
```

## 3. Módulo de Orçamentos ✅

### EstadoOrc (Enum)
```python
class EstadoOrc(str, enum.Enum):  
    rascunho = "rascunho"
    aprovado = "aprovado"
    rejeitado = "rejeitado"
```

### Orcamento
```python
class Orcamento(Base):
    __tablename__ = "Orcamentos"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    paciente_id: Integer -> Paciente.id (Not Null)
    entidade_id: Integer -> Entidades.id (Not Null)
    
    # Fields
    data: Date (Not Null)
    estado: Enum(EstadoOrc) (Not Null, Default=rascunho)
    total_entidade: Numeric(12,2) (Default=0, Not Null)
    total_paciente: Numeric(12,2) (Default=0, Not Null)
    observacoes: String (Nullable)
    
    # Relationships
    itens: One-to-Many -> OrcamentoItem (Cascade delete-orphan)
    paciente: Many-to-One -> Paciente
    entidade: Many-to-One -> Entidade
```

### OrcamentoItem
```python
class OrcamentoItem(Base):
    __tablename__ = "OrcamentoItens"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    orcamento_id: Integer -> Orcamentos.id (Not Null)
    artigo_id: Integer -> Artigos.id (Not Null)
    
    # Quantity & Pricing
    quantidade: Integer (Not Null, Default=1)
    preco_entidade: Numeric(10,2) (Not Null)
    preco_paciente: Numeric(10,2) (Not Null)
    subtotal_entidade: Numeric(12,2) (Not Null)
    subtotal_paciente: Numeric(12,2) (Not Null)
    
    # Dental specific fields
    numero_dente: SmallInteger (Nullable)
    face: ARRAY(TEXT) (Nullable) # M,D,V,L,O,I
    
    # Relationships
    orcamento: Many-to-One -> Orcamento
    artigo: Many-to-One -> ArtigoMedico
```

## 4. Módulo de Gestão Clínica ❓

### Paciente
```python
class Paciente(Base):
    __tablename__ = "Paciente"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    clinica_id: Integer -> Clinica.id (Not Null)
    
    # Personal Information
    nome: String(100) (Not Null)
    nif: String(20) (Unique, Nullable)
    data_nascimento: Date
    sexo: String(10) # M / F / Outro
    nacionalidade: String(50)
    tipo_documento: String(50) # CC, passaporte, etc.
    numero_documento: String(50) (Unique)
    validade_documento: Date (Nullable)
    
    # Contact Information
    telefone: String(20) (Unique)
    email: String(100) (Unique)
    pais_residencia: String(50)
    morada: String(200)
    
    # Relationships
    fichas: One-to-Many -> FichaClinica (Cascade delete-orphan)
    planos: One-to-Many -> PlanoTratamento (Cascade delete-orphan)
    clinica: Many-to-One -> Clinica (Lazy=joined)
    consultas: One-to-Many -> Consulta (Lazy=select)
    faturas: One-to-Many -> Fatura (Cascade delete-orphan)
```

### FichaClinica
```python
class FichaClinica(Base):
    __tablename__ = "FichaClinica"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    paciente_id: Integer -> Paciente.id (Not Null)
    
    # Timestamps
    data_criacao: DateTime (Server Default=now())
    
    # Personal Data
    estado_civil: String(50) (Nullable)
    profissao: String(100) (Nullable)
    endereco: Text (Nullable)
    telefone: String(20) (Nullable)
    local_trabalho: String(100) (Nullable)
    telefone_trabalho: String(20) (Nullable)
    tipo_beneficiario: String(50) (Nullable)
    numero_beneficiario: String(50) (Nullable)
    recomendado_por: String(100) (Nullable)
    data_questionario: Date (Nullable)
    
    # Medical Information
    queixa_principal: Text (Nullable)
    historia_medica: JSONB (Nullable) # Medical/Dental history Q&A
    exame_clinico: Text (Nullable) # Clinical exam notes
    plano_geral: JSONB (Nullable) # Dental map & tooth annotations
    observacoes_finais: Text (Nullable)
    
    # Audit Fields
    responsavel_criacao_id: Integer -> Utilizador.id (Not Null)
    responsavel_atualizacao_id: Integer -> Utilizador.id (Nullable)
    data_atualizacao: DateTime (OnUpdate=now())
    
    # Relationships
    paciente: Many-to-One -> Paciente
    anotacoes: One-to-Many -> AnotacaoClinica (Cascade delete-orphan)
    ficheiros: One-to-Many -> FicheiroClinico (Cascade delete-orphan)
```

### AnotacaoClinica
```python
class AnotacaoClinica(Base):
    __tablename__ = "AnotacaoClinica"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    ficha_id: Integer -> FichaClinica.id
    consulta_id: Integer -> Consultas.id (Nullable)
    
    # Fields
    texto: Text (Not Null)
    data: DateTime (Server Default=now())
    
    # Relationships
    ficha: Many-to-One -> FichaClinica
    consulta: Many-to-One -> Consulta
```

### FicheiroClinico
```python
class FicheiroClinico(Base):
    __tablename__ = "FicheiroClinico"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    ficha_id: Integer -> FichaClinica.id
    consulta_id: Integer -> Consultas.id (Nullable)
    
    # Fields
    tipo: String(50) # radiografia, pdf, imagem, etc.
    caminho_ficheiro: Text
    data_upload: DateTime (Server Default=now())
    
    # Relationships
    ficha: Many-to-One -> FichaClinica
    consulta: Many-to-One -> Consulta
```

### PlanoTratamento
```python
class PlanoTratamento(Base):
    __tablename__ = "PlanoTratamento"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    paciente_id: Integer -> Paciente.id (Not Null)
    
    # Fields
    data_criacao: DateTime(timezone=True) (Server Default=now(), Not Null)
    estado: String(50) (Not Null, Default="em_curso")
    data_conclusao: DateTime(timezone=True) (Nullable)
    
    # Relationships
    paciente: Many-to-One -> Paciente
    itens: One-to-Many -> PlanoItem (Cascade delete-orphan)
    faturas: One-to-One -> Fatura (Cascade delete-orphan)
```

### PlanoItem
```python
class PlanoItem(Base):
    __tablename__ = "PlanoItem"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    plano_id: Integer -> PlanoTratamento.id (Not Null)
    orcamento_item_id: Integer -> OrcamentoItens.id (Not Null)
    artigo_id: Integer -> Artigos.id (Not Null)
    
    # Planning Fields
    quantidade_prevista: Integer (Not Null)
    numero_dente: SmallInteger (Nullable)
    face: ARRAY(Text) (Nullable)
    
    # Execution Fields
    quantidade_executada: Integer (Not Null, Default=0)
    estado: String(20) (Not Null, Default="pendente")
    
    # Relationships
    plano: Many-to-One -> PlanoTratamento
    orcamento_item: Many-to-One -> OrcamentoItem (Lazy=joined)
    artigo: Many-to-One -> ArtigoMedico (Lazy=joined)
```

### Consulta
```python
class Consulta(Base):
    __tablename__ = "Consultas"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    paciente_id: Integer -> Paciente.id (Not Null)
    clinica_id: Integer -> Clinica.id (Not Null)
    medico_id: Integer -> Utilizador.id (Nullable)
    entidade_id: Integer -> Entidades.id (Not Null)
    
    # Temporal Fields
    data_inicio: DateTime(timezone=True) (Server Default=now(), Not Null)
    data_fim: DateTime(timezone=True) (Nullable)
    
    # Status & Notes
    estado: String(20) (Not Null, Default="iniciada")
    observacoes: String(500) (Nullable)
    
    # Audit Fields
    created_at: DateTime(timezone=True) (Server Default=now(), Not Null)
    updated_at: DateTime(timezone=True) (Server Default=now(), OnUpdate=now(), Not Null)
    
    # Relationships
    paciente: Many-to-One -> Paciente (Lazy=joined)
    anotacoes: One-to-Many -> AnotacaoClinica (Cascade delete-orphan)
    ficheiros: One-to-Many -> FicheiroClinico (Cascade delete-orphan)
    clinica: Many-to-One -> Clinica
    medico: Many-to-One -> Utilizador
    entidade: Many-to-One -> Entidade
    itens: One-to-Many -> ConsultaItem
    faturas: One-to-Many -> Fatura (Cascade delete-orphan)
```

### ConsultaItem
```python
class ConsultaItem(Base):
    __tablename__ = "ConsultaItens"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    consulta_id: Integer -> Consultas.id (Not Null)
    artigo_id: Integer -> Artigos.id (Not Null)
    
    # Dental Fields
    numero_dente: SmallInteger (Nullable)
    face: ARRAY(Text) (Nullable) # M, D, V, L, O, I
    
    # Pricing Fields
    quantidade: Integer (Not Null, Default=1)
    preco_unitario: Numeric(10,2) (Not Null)
    total: Numeric(12,2) (Not Null, Default=0)
    
    # Relationships
    consulta: Many-to-One -> Consulta
    artigo: Many-to-One -> ArtigoMedico
```

### Marcacao (Appointments)
```python
class Marcacao(Base):
    __tablename__ = "Marcacoes"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    paciente_id: Integer -> Paciente.id (Not Null)
    medico_id: Integer -> Utilizador.id (Not Null)
    clinic_id: Integer -> Clinica.id (Not Null)
    agendada_por: Integer -> Utilizador.id (Not Null)
    entidade_id: Integer -> Entidades.id (Not Null)
    
    # Scheduling Fields
    data_hora_inicio: DateTime(timezone=True) (Not Null)
    data_hora_fim: DateTime(timezone=True) (Not Null)
    titulo: String(200) (Not Null, Default="Marcação")
    estado: String(20) (Not Null, Default="agendada") # agendada, falta, iniciada, concluida, cancelada
    observacoes: Text (Nullable)
    
    # Audit Fields
    created_at: DateTime(timezone=True) (Server Default=now(), Not Null)
    updated_at: DateTime(timezone=True) (Server Default=now(), OnUpdate=now(), Not Null)
    
    # Relationships
    paciente: Many-to-One -> Paciente
    medico: Many-to-One -> Utilizador
    clinic: Many-to-One -> Clinica
    agendador: Many-to-One -> Utilizador
    entidade: Many-to-One -> Entidade
```

## 5. Módulo Financeiro ❓

### Categoria
```python
class Categoria(Base):
    __tablename__ = "Categorias"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Unique Fields
    slug: String (Unique, Not Null, Index)
    
    # Fields
    nome: String (Not Null)
    ordem: Integer (Default=0, Not Null)
    
    # Relationships
    artigos: One-to-Many -> ArtigoMedico (Cascade delete-orphan)
```

### ArtigoMedico
```python
class ArtigoMedico(Base):
    __tablename__ = "Artigos"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    categoria_id: Integer -> Categorias.id (Not Null)
    
    # Unique Constraint
    __table_args__ = UniqueConstraint("codigo", "descricao", "categoria_id")
    
    # Fields
    codigo: String (Not Null, Index)
    descricao: String (Not Null)
    requer_dente: Boolean (Not Null, Default=False)
    requer_face: Boolean (Not Null, Default=False) 
    face_count: SmallInteger (Nullable)
    
    # Relationships
    precos: One-to-Many -> Preco (Cascade delete-orphan)
    categoria: Many-to-One -> Categoria
```

### Entidade (Insurance/Entity)
```python
class Entidade(Base):
    __tablename__ = "Entidades"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Unique Fields
    slug: String (Unique, Not Null, Index)
    
    # Fields
    nome: String (Not Null)
    
    # Relationships
    precos: One-to-Many -> Preco (Cascade delete-orphan)
```

### Preco (Pricing Table)
```python
class Preco(Base):
    __tablename__ = "Precos"
    
    # Composite Primary Key
    artigo_id: Integer -> Artigos.id (PK)
    entidade_id: Integer -> Entidades.id (PK)
    
    # Pricing Fields
    valor_entidade: Numeric(10,2) (Not Null)
    valor_paciente: Numeric(10,2) (Not Null)
    
    # Relationships
    artigo: Many-to-One -> ArtigoMedico
    entidade: Many-to-One -> Entidade
```

### Billing Enums
```python
class FaturaTipo(enum.Enum):
    consulta = "consulta"
    plano = "plano"

class FaturaEstado(enum.Enum):
    pendente = "pendente"
    parcial = "parcial"
    paga = "paga"
    cancelada = "cancelada"

class ParcelaEstado(enum.Enum):
    pendente = "pendente"
    parcial = "parcial"
    paga = "paga"

class MetodoPagamento(enum.Enum):
    dinheiro = "dinheiro"
    cartao = "cartao"
    transferencia = "transferencia"
```

### Fatura (Invoice)
```python
class Fatura(Base):
    __tablename__ = "Faturas"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    paciente_id: Integer -> Paciente.id (Not Null)
    consulta_id: Integer -> Consultas.id (Nullable) # For consultation invoices
    plano_id: Integer -> PlanoTratamento.id (Nullable) # For treatment plan invoices
    
    # Fields
    data_emissao: DateTime(timezone=True) (Server Default=now(), Not Null)
    tipo: Enum(FaturaTipo) (Not Null)
    total: Numeric(12,2) (Not Null)
    estado: Enum(FaturaEstado) (Not Null, Default=pendente)
    
    # Relationships
    paciente: Many-to-One -> Paciente
    consulta: Many-to-One -> Consulta
    plano: Many-to-One -> PlanoTratamento
    itens: One-to-Many -> FaturaItem (Cascade delete-orphan)
    parcelas: One-to-Many -> ParcelaPagamento (Cascade delete-orphan)
    pagamentos: One-to-Many -> FaturaPagamento (Cascade delete-orphan)
```

### FaturaItem
```python
class FaturaItem(Base):
    __tablename__ = "FaturaItens"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    fatura_id: Integer -> Faturas.id (Not Null)
    
    # Origin tracking (from consulta_item or plano_item)
    origem_tipo: String(20) (Not Null)
    origem_id: Integer (Not Null)
    
    # Item details
    quantidade: Integer (Not Null, Default=1)
    preco_unitario: Numeric(10,2) (Not Null)
    total: Numeric(12,2) (Not Null)
    descricao: String(255) (Not Null)
    
    # Relationships
    fatura: Many-to-One -> Fatura
```

### ParcelaPagamento (Payment Installments)
```python
class ParcelaPagamento(Base):
    __tablename__ = "ParcelasPagamento"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    fatura_id: Integer -> Faturas.id (Not Null)
    
    # Installment Planning
    numero: Integer (Not Null)
    valor_planejado: Numeric(12,2) (Not Null)
    data_vencimento: DateTime(timezone=True) (Nullable)
    
    # Payment Execution
    valor_pago: Numeric(12,2) (Nullable)
    data_pagamento: DateTime(timezone=True) (Nullable)
    estado: Enum(ParcelaEstado) (Not Null, Default=pendente)
    metodo_pagamento: Enum(MetodoPagamento) (Nullable)
    
    # Relationships
    fatura: Many-to-One -> Fatura
```

### FaturaPagamento (Invoice Payments)
```python
class FaturaPagamento(Base):
    __tablename__ = "fatura_pagamentos"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    fatura_id: Integer -> Faturas.id (Not Null, OnDelete=CASCADE)
    
    # Payment Details
    valor: Numeric(10,2) (Not Null)
    data_pagamento: DateTime (Not Null, Default=utcnow)
    metodo_pagamento: Enum(MetodoPagamento) (Nullable)
    observacoes: String (Nullable)
    
    # Relationships
    fatura: Many-to-One -> Fatura
```

### Cash Management Enums
```python
class CaixaStatus(enum.Enum):
    aberto = "aberto"
    fechado = "fechado"
```

### CaixaSession (Cash Register Session)
```python
class CaixaSession(Base):
    __tablename__ = "CaixaSessions"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Key
    operador_id: Integer -> Utilizador.id (Not Null)
    
    # Session Management
    data_inicio: DateTime(timezone=True) (Server Default=now(), Not Null)
    valor_inicial: Numeric(12,2) (Not Null)
    status: Enum(CaixaStatus) (Not Null, Default=aberto)
    valor_final: Numeric(12,2) (Nullable)
    data_fecho: DateTime(timezone=True) (Nullable)
    
    # Relationships
    operador: Many-to-One -> Utilizador
    payments: One-to-Many -> CashierPayment (Cascade delete-orphan)
```

### CashierPayment
```python
class CashierPayment(Base):
    __tablename__ = "CaixaPayments"
    
    # Primary Key
    id: Integer (PK, Index)
    
    # Foreign Keys
    session_id: Integer -> CaixaSessions.id (Not Null)
    fatura_id: Integer -> Faturas.id (Nullable)
    parcela_id: Integer -> ParcelasPagamento.id (Nullable)
    operador_id: Integer -> Utilizador.id (Not Null)
    
    # Payment Details
    valor_pago: Numeric(12,2) (Not Null)
    metodo_pagamento: Enum(MetodoPagamento) (Nullable)
    data_pagamento: DateTime(timezone=True) (Server Default=now(), Not Null)
    observacoes: Text (Nullable)
    
    # Relationships
    session: Many-to-One -> CaixaSession
    operador: Many-to-One -> Utilizador
```

## 6. Módulo de Stock (Additional)

### ItemStock
```python
class ItemStock(Base):
    __tablename__ = "ItemStock"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    clinica_id: Integer -> Clinica.id
    
    # Item Details
    nome: String(100) (Not Null)
    descricao: Text
    quantidade_minima: Integer (Not Null)
    tipo_medida: String(30) (Not Null)
    fornecedor: String(100)
    ativo: Boolean (Default=True)
    
    # Relationships
    movimentos: One-to-Many -> MovimentoStock
    filiais: One-to-Many -> ItemFilial
    lotes: One-to-Many -> ItemLote
```

### MovimentoStock
```python
class MovimentoStock(Base):
    __tablename__ = "MovimentoStock"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Keys
    item_id: Integer -> ItemStock.id
    utilizador_id: Integer -> Utilizador.id
    
    # Movement Details
    tipo_movimento: String(50) (Not Null)
    quantidade: Integer (Not Null)
    data: DateTime (Default=utcnow)
    justificacao: Text
    
    # Relationships
    utilizador: Many-to-One -> Utilizador
    item: Many-to-One -> ItemStock
```

### ItemFilial
```python
class ItemFilial(Base):
    __tablename__ = "ItemFilial"
    
    # Composite Primary Key
    item_id: Integer -> ItemStock.id (PK)
    filial_id: Integer -> Clinica.id (PK)
    
    # Fields
    quantidade: Integer (Not Null)
    
    # Relationships
    item: Many-to-One -> ItemStock
```

### ItemLote
```python
class ItemLote(Base):
    __tablename__ = "ItemLote"
    
    # Primary Key
    id: Integer (PK)
    
    # Foreign Key
    item_id: Integer -> ItemStock.id (Not Null)
    
    # Batch Details
    lote: String(50) (Not Null)
    validade: Date (Not Null)
    quantidade: Integer (Not Null)
    
    # Relationships
    item: Many-to-One -> ItemStock
```

## Key Relationships Summary

### Central Entity Relationships:
- **Utilizador** ↔ **UtilizadorClinica** ↔ **Clinica** (Many-to-Many with roles)
- **Paciente** → **Clinica** (Many-to-One)
- **Paciente** → **FichaClinica** → **AnotacaoClinica**, **FicheiroClinico**
- **Orcamento** → **OrcamentoItem** → **ArtigoMedico**
- **Consulta** → **ConsultaItem** → **ArtigoMedico**
- **PlanoTratamento** → **PlanoItem** → **OrcamentoItem**
- **Fatura** → **FaturaItem** (from ConsultaItem or PlanoItem)
- **ArtigoMedico** ↔ **Preco** ↔ **Entidade** (Price matrix)
- **Categoria** → **ArtigoMedico** (One-to-Many)

### Financial Flow:
1. **Orcamento** (Budget) → **PlanoTratamento** (Treatment Plan)
2. **PlanoTratamento** → **Consulta** (Consultations execute plan items)
3. **Consulta** → **Fatura** (Invoicing for services)
4. **Fatura** → **FaturaPagamento** / **ParcelaPagamento** (Payments)
5. **CaixaSession** → **CashierPayment** (Cash register management)

This comprehensive data structure provides all the information needed to create detailed UML class diagrams for each module of the dental clinic management system.