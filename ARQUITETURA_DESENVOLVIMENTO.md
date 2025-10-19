# Sistema de Gestão de Clínica Dentária - Arquitetura e Padrões de Desenvolvimento

## 1. Organização do Código e Arquitetura

### Estrutura Modular do Backend (FastAPI)

O backend segue uma arquitetura em camadas bem definida, baseada em Domain-Driven Design:

```
back/src/
├── core/                    # Configuração central
│   ├── config.py           # Settings e configurações
│   └── database.py         # Configuração da base de dados
├── utilizadores/           # Módulo de utilizadores
│   ├── models.py          # Modelos SQLAlchemy
│   ├── schemas.py         # Validação Pydantic
│   ├── service.py         # Lógica de negócio
│   ├── router.py          # Endpoints FastAPI
│   ├── dependencies.py    # Dependências de injeção
│   ├── utils.py           # Utilitários do módulo
│   └── exceptions.py      # Exceções específicas
├── clinica/               # Módulo de clínicas
├── pacientes/             # Módulo de pacientes
├── marcacoes/             # Módulo de marcações
├── orcamento/             # Módulo de orçamentos
├── faturacao/             # Módulo de faturação
├── stock/                 # Módulo de stock
├── auditoria/             # Sistema de auditoria
└── ...
```

**Padrões de Organização por Módulo:**
- `models.py`: Entidades SQLAlchemy com relacionamentos
- `schemas.py`: Validação e serialização com Pydantic
- `service.py`: Lógica de negócio e regras de domínio
- `router.py`: Endpoints REST com injeção de dependências
- `dependencies.py`: Autenticação e autorização
- `utils.py`: Funções auxiliares específicas do módulo

### Organização do Frontend (Nuxt.js 3)

O frontend utiliza a estrutura convencional do Nuxt 3 com componentização baseada em shadcn/ui:

```
front/
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   │   ├── card/
│   │   ├── button/
│   │   ├── input/
│   │   └── ...
│   └── nav/               # Componentes de navegação
├── composables/           # Lógica reutilizável
│   ├── useUtilizadores.ts
│   ├── usePacientes.ts
│   ├── useOrcamentos.ts
│   └── apiService.ts     # Cliente HTTP central
├── pages/                # Páginas organizadas por perfil
│   ├── doctor/
│   ├── diretor/
│   ├── assistant/
│   └── index.vue
├── types/                # Definições TypeScript
├── middleware/           # Autenticação e rota
└── nuxt.config.ts       # Configuração principal
```

### Padrões de Código e Convenções Adotadas

**Backend (Python/FastAPI):**
- Utilização de type hints em todas as funções
- Padrão de nomenclatura snake_case
- Separação clara entre modelos de dados e DTOs (schemas)
- Injeção de dependências através do sistema FastAPI
- Validação de dados dupla (Pydantic + SQLAlchemy)

**Frontend (TypeScript/Vue 3):**
- Composition API para lógica reativa
- Nomenclatura camelCase para propriedades
- Tipos TypeScript explícitos para todas as interfaces
- Composables para lógica reutilizável
- Componentes shadcn/ui para consistência visual

## 2. Implementação de Funcionalidades Críticas

### Autenticação JWT - Implementação de Segurança

**Fluxo de Autenticação:**
```python
# back/src/utilizadores/service.py:60-86
def autenticar_utilizador(db: Session, email_or_username: str, password: str):
    utilizador = db.query(models.Utilizador).filter(
        (models.Utilizador.email == email_or_username) | 
        (models.Utilizador.username == email_or_username)
    ).first()
    
    if not utilizador:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    
    # Proteção contra ataques de força bruta
    if utilizador.bloqueado:
        raise HTTPException(status_code=403, detail="Conta bloqueada por excesso de tentativas.")
    
    if not utils.verify_password(password, utilizador.password_hash):
        utilizador.tentativas_falhadas += 1
        if utilizador.tentativas_falhadas >= 5:
            utilizador.bloqueado = True
        db.commit()
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
```

**Características de Segurança:**
- Bloqueio automático após 5 tentativas falhadas
- Tokens JWT com expiração configurável por utilizador
- Hash de passwords usando bcrypt
- Refresh tokens para renovação automática
- Auditoria completa de sessões

### Validação de Dados - Dupla Validação

**Frontend (TypeScript):**
```typescript
// front/composables/useUtilizadores.ts:24-30
try {
  users.value = await get("utilizadores");
} catch (e: any) {
  error.value = e.message || String(e);
} finally {
  loading.value = false;
}
```

**Backend (Pydantic + SQLAlchemy):**
```python
# Validação Pydantic nos schemas
class UtilizadorCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    telefone: str = Field(..., pattern=r'^\d{9}$')

# Validação adicional no service layer
if db.query(models.Utilizador).filter(models.Utilizador.email == dados.email).first():
    raise HTTPException(status_code=400, detail="Email já está registado.")
```

### Campos Odontológicos Específicos - Arrays de Faces, Números de Dente

**Modelo de Dados Odontológicos:**
```python
# back/src/orcamento/models.py:48-49
numero_dente = Column(SmallInteger, nullable=True)
face = Column(ARRAY(TEXT), nullable=True)  # M,D,V,L,O,I (faces do dente)
```

**Implementação Frontend:**
- Componentes especializados para seleção de dentes
- Odontograma interativo para visualização dental
- Validação de números de dente (1-32 para adultos, 51-85 para crianças)
- Interface gráfica para seleção de faces dentárias

### Cálculos Automáticos - Totais de Orçamentos, Validações Financeiras

**Cálculo Automático de Totais:**
```python
# Cálculo de subtotais em OrcamentoItem
subtotal_entidade = Column(Numeric(12, 2), nullable=False)
subtotal_paciente = Column(Numeric(12, 2), nullable=False)

# Totais agregados no Orcamento
total_entidade = Column(Numeric(12, 2), default=0, nullable=False)
total_paciente = Column(Numeric(12, 2), default=0, nullable=False)
```

**Validações Financeiras:**
- Precisão decimal fixa (12,2) para valores monetários
- Validação de valores positivos
- Cálculos automáticos de IVA e descontos
- Controlo de integridade entre orçamentos e faturas

## 3. Integração entre Módulos

### Comunicação entre Módulos

**Padrão de Relacionamentos:**
```python
# Relacionamentos SQLAlchemy bem definidos
paciente = relationship("Paciente")
entidade = relationship("Entidade")
itens = relationship("OrcamentoItem", back_populates="orcamento", 
                    cascade="all, delete-orphan")
```

**APIs REST Consistentes:**
- Padronização de endpoints `/modulo/{id}/acao`
- Códigos de estado HTTP consistentes
- Serialização automática via Pydantic
- Documentação automática via OpenAPI

### Gestão de Estado no Frontend

**Composables para Estado Global:**
```typescript
// front/composables/useUtilizadores.ts:15-20
export function useUtilizadores() {
  const { get, post, put } = useApiService();
  const users = ref<UtilizadorResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
```

**Características:**
- Estado reativo com Vue 3 Composition API
- Gestão de loading e erro por composable
- Cache local em refs reativas
- Invalidação automática de dados

### APIs REST e Serialização de Dados

**Serialização Automática:**
```python
# Schemas Pydantic para resposta consistente
class UtilizadorResponse(BaseModel):
    id: int
    username: str
    nome: str
    email: str
    telefone: str
    ativo: bool
    perfil: Optional[PerfilResponse]
    clinicas: List[ClinicaAssociacao]
```

## 4. Desafios Técnicos e Soluções

### Campos JSONB para Flexibilidade Clínica

**Utilizações de JSONB:**
- Configurações flexíveis de clínica
- Metadados de ficheiros de pacientes
- Campos personalizáveis por tipo de consulta
- Histórico de alterações em auditoria

### Multi-tenancy com Isolamento por clinica_id

**Implementação de Multi-tenancy:**
```python
# back/src/utilizadores/models.py:25-36
class UtilizadorClinica(Base):
    utilizador_id = Column(Integer, ForeignKey("Utilizador.id"))
    clinica_id = Column(Integer, ForeignKey("Clinica.id"))  # Isolamento por clínica
    perfil_id = Column(Integer, ForeignKey("Perfil.id"))
    ativo = Column(Boolean, default=True)
```

**Características:**
- Isolamento de dados por `clinica_id` em todas as consultas
- Perfis específicos por clínica
- Sessões vinculadas à clínica ativa
- Auditoria separada por contexto de clínica

### Gestão de Migrações com Alembic

**Estrutura de Migrações:**
```
back/alembic/versions/
├── 13d77e6bcb54_criação_das_tabelas_iniciais.py
├── 8cfcdae42284_criando_novos_campos_do_utilizador.py
├── e992aa8abcd1_criando_novos_campos_utilizadorclinica.py
└── ...
```

**Práticas de Migração:**
- Versionamento incremental com mensagens descritivas
- Rollback automático em caso de erro
- Validação de integridade antes de aplicar
- Backup automático antes de migrações críticas

### Performance e Otimizações Implementadas

**Otimizações de Base de Dados:**
- Índices em chaves estrangeiras e campos de pesquisa
- Queries eager loading para evitar N+1
- Paginação automática em listagens
- Cache de sessões e perfis de utilizador

**Otimizações Frontend:**
- Lazy loading de páginas com Nuxt 3
- Componentes assíncronos para módulos pesados
- Debounce em campos de pesquisa
- Virtual scrolling em listas grandes

## 5. Tratamento de Erros e Qualidade

### Tratamento de Erros no Backend

**Hierarquia de Exceções:**
```python
# Exceções HTTP padronizadas
HTTPException(status_code=400, detail="Dados inválidos")
HTTPException(status_code=401, detail="Credenciais inválidas")  
HTTPException(status_code=403, detail="Acesso negado")
HTTPException(status_code=404, detail="Recurso não encontrado")
```

**Padrões de Tratamento:**
- Validação prévia com mensagens específicas
- Log de erros com contexto completo
- Rollback automático de transações
- Respostas de erro estruturadas

### Tratamento de Erros no Frontend

**Gestão de Erros em Composables:**
```typescript
try {
  users.value = await get("utilizadores");
} catch (e: any) {
  error.value = e.message || String(e);
} finally {
  loading.value = false;
}
```

**Características:**
- Estados de loading/erro por operação
- Mensagens de erro amigáveis ao utilizador
- Retry automático em falhas de rede
- Fallback para dados cached quando disponível

### Logging e Auditoria

**Sistema de Auditoria Integrado:**
```python
# back/src/auditoria/utils.py - registrar_auditoria()
def registrar_auditoria(db: Session, utilizador_id: int, acao: str, 
                       entidade: str, entidade_id: int, detalhes: str):
    auditoria = models.Auditoria(
        utilizador_id=utilizador_id,
        acao=acao,
        entidade=entidade, 
        entidade_id=entidade_id,
        detalhes=detalhes,
        timestamp=datetime.utcnow()
    )
    db.add(auditoria)
    db.commit()
```

**Eventos Auditados:**
- Login/logout de utilizadores
- Criação/atualização/eliminação de registos
- Alterações de permissões
- Operações financeiras (orçamentos, faturas)
- Acesso a dados sensíveis de pacientes

### Documentação Automática da API

**OpenAPI/Swagger:**
- Documentação automática via FastAPI
- Schemas Pydantic geram documentação de tipos
- Exemplos de request/response
- Testes interativos na interface `/docs`

**Características da Documentação:**
```python
app = FastAPI(
    title="Clínica Dentária API",
    description="API para gestão de utilizadores, perfis e autenticação da clínica dentária.",
    version="1.0.0",
    contact={"name": "Nome da Clínica", "email": "contato@clinicadentaria.com"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"}
)
```

### Padrões de Qualidade

**Validação e Testes:**
- Validação de dados em duas camadas (frontend + backend)
- Tipos TypeScript rigorosos no frontend
- Validação de schema Pydantic no backend
- Testes de integração para fluxos críticos

**Segurança:**
- Autenticação JWT obrigatória em todos os endpoints
- Controlo de acesso baseado em perfis
- Proteção CORS configurada
- Sanitização de inputs contra SQL injection
- Rate limiting em endpoints críticos

Esta arquitetura garante escalabilidade, maintibilidade e segurança do sistema, seguindo as melhores práticas para aplicações web modernas.