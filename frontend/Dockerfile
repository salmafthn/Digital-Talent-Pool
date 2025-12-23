# Gunakan Node.js
FROM node:20-alpine

# Set folder kerja
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Tambahkan flag --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy seluruh kode
COPY . .

# --- BAGIAN PENTING DARI CHAT HISTORY ---
# Menerima argumen yang dikirim dari docker-compose
ARG NEXT_PUBLIC_API_URL
# Set menjadi environment variable agar terbaca saat build/runtime
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Jalankan mode development
CMD ["npm", "run", "dev"]
