FROM python:3.12-slim

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libgobject-2.0-0 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libfontconfig1 \
    libgdk-pixbuf-xlib-2.0-0 \
    libxml2 \
    libxslt1.1 \
    libffi8 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port (Vercel assigns the PORT environment variable)
EXPOSE 8000

# Run migrations and start the application
CMD ["sh", "-c", "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]