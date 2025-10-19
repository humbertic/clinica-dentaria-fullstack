# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a dental clinic management system with a FastAPI backend and Nuxt 3 frontend:

- **Backend**: Python FastAPI application in `/back/`
- **Frontend**: Nuxt 3 Vue.js application in `/front/`

## Development Commands

### Backend (Python FastAPI)
From `/back/` directory:
- **Start development server**: `uvicorn src.main:app --reload` (runs on http://localhost:8000)
- **Database migrations**: `alembic upgrade head` (apply migrations) or `alembic revision --autogenerate -m "description"` (create new migration)
- **Install dependencies**: `pip install -r requirements.txt`

### Frontend (Nuxt 3)
From `/front/` directory:
- **Development server**: `yarn dev` or `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `yarn build` or `npm run build`
- **Preview production build**: `yarn preview` or `npm run preview`
- **Install dependencies**: `yarn install` or `npm install`

## Architecture Overview

### Backend Architecture
- **Framework**: FastAPI with SQLAlchemy ORM and PostgreSQL database
- **Authentication**: JWT tokens with role-based access control
- **Database**: PostgreSQL with Alembic migrations
- **Structure**: Domain-driven design with modules for each entity (utilizadores, pacientes, clinica, etc.)

Key modules:
- `utilizadores/` - User management and authentication
- `pacientes/` - Patient management and medical records
- `clinica/` - Clinic configuration and settings
- `marcacoes/` - Appointments scheduling
- `orcamento/` - Treatment budgets and estimates
- `faturacao/` - Billing and invoicing
- `stock/` - Inventory management
- `mensagens/` - Internal messaging system
- `pdf/` - PDF generation for reports/invoices
- `email/` - Email notifications

### Frontend Architecture
- **Framework**: Nuxt 3 with Vue 3, TypeScript, and Tailwind CSS
- **UI Components**: shadcn/ui components with Radix Vue primitives
- **State Management**: Composables pattern with reactive data
- **Routing**: File-based routing with role-based page access

Key features:
- Multi-role dashboard (master, diretor, doctor, frontdesk, assistant)
- Real-time messaging with WebSocket support
- Odontogram (dental chart) for treatment planning
- Appointment scheduling with calendar integration
- Patient management with file uploads
- Billing and payment processing

### Database Schema
Key entities and relationships:
- `Utilizador` (Users) ↔ `UtilizadorClinica` ↔ `Clinica` (Many-to-many with roles)
- `Paciente` (Patients) → `FichaClinica` (Medical records)
- `Marcacao` (Appointments) → `Consulta` (Consultations)
- `Orcamento` (Budgets) → `OrcamentoItem` (Budget items)
- `Fatura` (Invoices) → `FaturaItem` (Invoice items)
- Stock management with `ItemStock`, `MovimentoStock`, `ItemLote`

## Configuration

### Backend Configuration
- Database connection: Configure in `src/core/config.py` or `.env` file
- Default database: PostgreSQL (localhost:5432/clinica_db)
- JWT secret and token expiration settings in config

### Frontend Configuration
- API base URL: Set in `nuxt.config.ts` runtimeConfig (default: http://localhost:8000/)
- Tailwind CSS with custom component styling
- shadcn/ui components configured in `components.json`

## Development Guidelines

### Backend Development
- Each module follows the pattern: `models.py`, `schemas.py`, `service.py`, `router.py`
- Database models use SQLAlchemy declarative base
- Pydantic schemas for request/response validation
- Router includes proper dependency injection for authentication
- All endpoints require proper JWT token authentication

### Frontend Development
- Use composables for API calls and shared logic (located in `/composables/`)
- Page components organized by user role in `/pages/`
- Reusable UI components in `/components/ui/`
- TypeScript interfaces defined in `/types/`
- Middleware handles authentication and role-based routing

### Database Operations
- Use Alembic for all schema changes
- Models must be imported in the Alembic `env.py` for auto-generation
- Foreign key relationships properly defined with SQLAlchemy
- Audit fields (created_at, updated_at) handled through mixins where applicable