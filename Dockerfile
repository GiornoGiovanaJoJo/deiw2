# Build Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if needed (e.g. for some python packages)
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend to the path expected by main.py
# main.py expects: ../frontend/dist/assets relative to itself
# structured as: /app/backend/app/main.py
# so it looks for /app/frontend/dist/assets
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Set permissions
RUN chmod -R 755 /app

# Set python path to allow imports from backend directory
ENV PYTHONPATH=/app/backend

# Expose port (Railway will override this but good for documentation)
EXPOSE 8000

# Run application
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
