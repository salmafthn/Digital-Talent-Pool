# Digital Talent Pool - Tim 4 DTP

Repositori ini berisi source code backend untuk sistem Retrieval-Augmented Generation (RAG) yang dikembangkan dalam program Artificial Intelligence Talent Factory (AITF). Sistem ini menangani pemrosesan dokumen, penyimpanan vektor (Vector Database), dan manajemen infrastruktur AI.

## Daftar Isi

1. [Akses Server (Deployment)](#akses-server-deployment)
2. [Instalasi Lokal dengan Docker](#instalasi-lokal-dengan-docker)
3. [Manajemen Database (PostgreSQL)](#manajemen-database-postgresql)
4. [Tech Stack](#tech-stack)

---

## Akses Server (Deployment)

Aplikasi backend telah dideploy pada Virtual Private Server (VPS) dan dapat diakses melalui URL berikut untuk keperluan testing API (Swagger UI):

**Base URL:**
`http://85.218.235.6:39997/`

> **Catatan:** Pastikan Anda terhubung dengan jaringan yang stabil.

---

## Jika Ingin Menggunakan Docker - Instalasi Lokal dengan Docker

Untuk menjalankan proyek ini di mesin lokal atau server sendiri menggunakan Docker, ikuti langkah-langkah berikut:

### Prasyarat
- Docker Engine
- Docker Compose
- Git

### Langkah Instalasi

1. **Clone Repository**
   Salin repositori ini ke mesin lokal Anda:
   ```bash
   git clone [https://github.com/username/repo-name.git](https://github.com/username/repo-name.git)
   cd repo-name

2. **Konfigurasi Environment Variable**
Salin file contoh konfigurasi dan sesuaikan isinya.
```bash
cp .env.example .env

```


Pastikan variabel `DATABASE_URL` diatur untuk menggunakan host service docker container, bukan localhost:
`postgresql://postgres:password@db:5432/dtp_db`
3. **Jalankan Container**
Bangun dan jalankan service menggunakan Docker Compose:
```bash
docker compose up -d --build

```


4. **Verifikasi Instalasi**
Cek status container untuk memastikan semua service berjalan (Backend, DB, Qdrant):
```bash
docker ps

```


Jika berhasil, API dapat diakses di `http://localhost:8000/docs`.

---

## Manajemen Database (PostgreSQL)

Untuk alasan keamanan dan stabilitas, port database tidak dibuka ke publik (internet). Akses database hanya diperbolehkan melalui **SSH Tunneling** ke VPS.

### Cara Koneksi (via pgAdmin / DBeaver)

Gunakan pengaturan berikut pada database client Anda:

**1. SSH Tunnel Configuration (Bastion Host):**

* **Host:** 85.218.235.6
* **Port:** 39609 (Custom SSH Port)
* **Username:** tim4
* **Auth Method:** Identity File (Private Key)

**2. Database Connection (Target):**

* **Host:** 127.0.0.1 (Localhost relative to VPS)
* **Port:** 5433 (Internal Port)
* **Username:** postgres
* **Password:** (Sesuai konfigurasi tim)
* **Database:** dtp_db

> **Penting:** Jangan mencoba menghubungkan database langsung melalui IP Publik tanpa SSH Tunnel karena koneksi akan ditolak oleh firewall server.

---

## Tech Stack

* **Language:** Python 3.10+
* **Framework:** FastAPI
* **Database:** PostgreSQL 15
* **Vector Search:** Qdrant
* **Infrastructure:** Docker & Docker Compose
* **Server:** Linux VPS (Ubuntu)
