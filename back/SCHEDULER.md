# Scheduler de Tarefas Automáticas

Este documento descreve o sistema de tarefas agendadas (scheduler) implementado na aplicação.

## 📅 Alertas Automáticos de Stock

O sistema verifica **automaticamente** todos os dias às **8h da manhã** (timezone Europe/Lisbon) e envia emails de alertas para os assistentes quando:

### Condições de Alerta

1. **Stock Baixo**: Itens onde `quantidade_atual < quantidade_minima`
2. **Itens a Expirar**: Lotes com validade dentro de 30 dias

### Como Funciona

1. **Scheduler Inicia**: Quando a aplicação FastAPI inicia, o scheduler é automaticamente iniciado
2. **Execução Diária**: Todos os dias às 8h00, o scheduler:
   - Busca todas as clínicas ativas no sistema
   - Para cada clínica:
     - Verifica itens com stock baixo
     - Verifica lotes próximos do vencimento
     - Se houver alertas, envia email para **todos os assistentes** da clínica
3. **Logs**: Todas as execuções são registadas nos logs da aplicação

### Configuração

O scheduler está configurado em:
- **Arquivo**: `/back/src/scheduler/stock_alerts.py`
- **Horário**: 8h00 (configurável via CronTrigger)
- **Timezone**: Europe/Lisbon (configurável)
- **Dias de Alerta**: 30 dias antes do vencimento (configurável)

### Alterar Horário de Execução

Para alterar o horário, edite o arquivo `/back/src/scheduler/stock_alerts.py`:

```python
trigger = CronTrigger(
    hour=8,        # Altere aqui (0-23)
    minute=0,      # Altere aqui (0-59)
    timezone="Europe/Lisbon"
)
```

Exemplos:
- `hour=9, minute=30` → Executa às 9h30
- `hour=20, minute=0` → Executa às 20h00
- `day_of_week='mon-fri', hour=8` → Apenas dias úteis às 8h

### Alterar Dias de Alerta

Para alterar quantos dias antes do vencimento os alertas devem ser enviados, edite:

```python
await email_manager.enviar_alertas_stock(
    clinica_id=clinica.id,
    itens_baixo_stock=itens_baixo_stock,
    itens_expirando=itens_expirando,
    dias_expiracao=30  # Altere aqui
)
```

## 🔧 Endpoints Manuais

### 1. Enviar Alertas para Uma Clínica

**Endpoint**: `POST /email/alertas-stock`

**Parâmetros**:
- `clinica_id` (obrigatório): ID da clínica
- `dias_expiracao` (opcional, padrão 30): Dias para alerta de expiração

**Uso**: Enviar alertas manualmente para uma clínica específica

```bash
curl -X POST "http://localhost:8000/email/alertas-stock?clinica_id=1&dias_expiracao=30" \
  -H "Authorization: Bearer <token>"
```

**Resposta**:
```json
{
  "detail": "Alertas enviados com sucesso",
  "alertas": {
    "itens_baixo_stock": 3,
    "itens_expirando": 5,
    "total": 8
  }
}
```

### 2. Executar Verificação para Todas as Clínicas

**Endpoint**: `POST /email/alertas-stock/executar-agora`

**Uso**: Executar imediatamente a verificação automática (sem esperar pelas 8h)

```bash
curl -X POST "http://localhost:8000/email/alertas-stock/executar-agora" \
  -H "Authorization: Bearer <token>"
```

**Resposta**:
```json
{
  "detail": "Verificação de alertas iniciada em background para todas as clínicas",
  "message": "Os alertas serão processados e enviados em alguns instantes"
}
```

## 📧 Template de Email

O email enviado aos assistentes inclui:
- **Cabeçalho**: Nome da clínica com ícone de alerta
- **Tabela de Stock Baixo**: Itens críticos com quantidade atual vs. mínima
- **Tabela de Itens a Expirar**: Lotes com contador de dias restantes
- **Ações Recomendadas**: Checklist de tarefas a realizar
- **Design Profissional**: Responsivo e com cores baseadas em urgência

### Cores de Urgência (Itens a Expirar)
- **≤ 7 dias**: Vermelho intenso (CRÍTICO)
- **≤ 15 dias**: Amarelo/Laranja (URGENTE)
- **≤ 30 dias**: Amarelo claro (ATENÇÃO)

## 🔍 Logs e Monitoramento

O scheduler gera logs detalhados:

```
🔔 Iniciando verificação de alertas de stock para 3 clínica(s)
  ℹ️  Clínica 'Clínica Centro' (ID: 1): Sem alertas
  ✅ Clínica 'Clínica Norte' (ID: 2): 8 alerta(s) enviado(s) (3 stock baixo, 5 a expirar)
  ❌ Erro ao processar alertas para clínica 'Clínica Sul' (ID: 3): ...
🔔 Verificação concluída. Total de 8 alerta(s) enviado(s)
```

Para visualizar os logs:
```bash
# Durante desenvolvimento
tail -f logs/app.log

# Em produção (se estiver usando uvicorn)
uvicorn src.main:app --log-level info
```

## 🚀 Inicialização

O scheduler é iniciado automaticamente quando a aplicação FastAPI inicia:

```python
# main.py
@app.on_event("startup")
async def startup_event():
    start_scheduler()  # ← Inicia automaticamente

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()   # ← Para gracefully
```

## 📦 Dependências

O scheduler usa APScheduler:
```
APScheduler==3.10.4
```

Instalação:
```bash
pip install -r requirements.txt
```

## 🧪 Testes

### Testar Manualmente

1. **Via Frontend**: Clique no botão "Enviar Alertas" na página de Stock
2. **Via API**: Use o endpoint `/email/alertas-stock/executar-agora`
3. **Via Logs**: Aguarde a execução às 8h e verifique os logs

### Verificar se o Scheduler Está Ativo

```python
from src.scheduler.stock_alerts import scheduler

if scheduler and scheduler.running:
    print("✅ Scheduler está ativo")
    print("Próxima execução:", scheduler.get_jobs()[0].next_run_time)
else:
    print("❌ Scheduler não está ativo")
```

## ⚙️ Configurações Avançadas

### Múltiplos Horários

Para executar em vários horários (ex: 8h e 20h):

```python
# Manhã
scheduler.add_job(
    enviar_alertas_todas_clinicas,
    CronTrigger(hour=8, minute=0),
    id="stock_alerts_morning",
)

# Noite
scheduler.add_job(
    enviar_alertas_todas_clinicas,
    CronTrigger(hour=20, minute=0),
    id="stock_alerts_evening",
)
```

### Apenas Dias Úteis

```python
trigger = CronTrigger(
    day_of_week='mon-fri',  # Segunda a Sexta
    hour=8,
    minute=0,
    timezone="Europe/Lisbon"
)
```

### Executar Semanalmente

```python
trigger = CronTrigger(
    day_of_week='mon',  # Apenas segundas-feiras
    hour=8,
    minute=0,
    timezone="Europe/Lisbon"
)
```

## 🛠️ Troubleshooting

### Scheduler Não Está Executando

1. Verifique se a aplicação iniciou corretamente
2. Procure por logs de erro no startup
3. Certifique-se de que APScheduler está instalado

### Emails Não Estão Sendo Enviados

1. Verifique se há assistentes cadastrados na clínica
2. Verifique se os assistentes têm email configurado
3. Verifique a configuração de email da clínica
4. Verifique os logs para erros de envio

### Alterar Timezone

```python
trigger = CronTrigger(
    hour=8,
    minute=0,
    timezone="America/Sao_Paulo"  # Altere aqui
)
```

## 📝 Notas Importantes

- O scheduler executa em **background** e não bloqueia a aplicação
- Cada clínica é processada **independentemente** (erros em uma não afetam as outras)
- Se não houver alertas, **nenhum email é enviado**
- O scheduler **persiste** mesmo após restart da aplicação
- Os emails são enviados **apenas para assistentes ativos** da clínica
