# Gunakan Python versi ringan
FROM python:3.10-slim

# Set folder kerja di dalam container
WORKDIR /app

# Install dependency sistem yang dibutuhkan PostgreSQL (libpq-dev)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements dulu agar caching Docker optimal
COPY requirements.txt .

# Install library Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy sisa kodingan (meskipun nanti akan ditimpa oleh volumes di docker-compose)
COPY . .

# Command default (akan di-override oleh docker-compose, tapi ini backup yang bagus)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
