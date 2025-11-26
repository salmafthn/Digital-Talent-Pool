# DTP Backend API

Backend ini dibangun menggunakan Python (FastAPI). Sistem menggunakan PostgreSQL sebagai database utama (via SQLAlchemy), Google Gemini untuk fitur AI Chat, dan sistem manajemen file statis untuk upload dokumen/gambar.

## Prasyarat Sistem

Pastikan di komputer Anda sudah terinstall:

- Python 3.10 atau lebih baru (3.12 direkomendasikan)
- PostgreSQL (untuk database lokal)
- Git

## Cara Install dan Menjalankan

Ikuti langkah berikut untuk menjalankan server di lingkungan lokal:

1. **Masuk ke Folder Backend**
   Pastikan terminal Anda berada di dalam folder `backend`.

2. **Buat Virtual Environment**
   Disarankan menggunakan virtual environment agar library tidak bentrok dengan sistem lain.

   ```bash
   python -m venv venv

   ```

3. **Aktifkan Virtual Environment**

   - Windows (CMD): `venv\Scripts\activate`
   - Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
   - Mac/Linux: `source venv/bin/activate`

4. **Install Dependencies**
   Install seluruh library yang dibutuhkan dari file requirements.

   ```bash
   pip install -r requirements.txt

   ```

5. **Konfigurasi Environment Variable (.env)**

   - Buat file baru bernama `.env` di dalam folder `backend/`.
   - Copy isi dari `.env.example` (jika ada) atau gunakan format berikut:

     ```ini
     # Database Configuration (PostgreSQL)
     DATABASE_URL="postgresql://user:password@localhost:5432/dtp_db"

     # Security (JWT)
     SECRET_KEY="isi_dengan_random_string_panjang"
     ALGORITHM="HS256"
     ACCESS_TOKEN_EXPIRE_MINUTES=30

     ```

6. **Setup Database & Seeding Data**
   Digunakan untuk mengisi database dengan data dummy (User, Profil, Pendidikan, dll) secara otomatis:

   ```bash
   python -m app.initial_data
   ```

7. **Jalankan Server**
   Gunakan perintah berikut untuk menjalankan server mode development:

   ```bash
   uvicorn app.main:app --reload
   ```

8. **Akses Aplikasi**

   - Mencoba API (Swagger UI): http://127.0.0.1:8000/docs
   - File Uploads (Static): https://www.google.com/search?q=http://127.0.0.1:8000/static/

## Struktur Folder Project

Struktur proyek mengikuti pola Modular Monolith untuk skalabilitas:

```text
backend/
├── uploads/                # Tempat penyimpanan file fisik (Avatar/Sertifikat)
├── app/                    # Source code utama
│   ├── api/
│   │   ├── routes/         # Endpoint API (Auth, Profile, Chat)
│   │   ├── deps.py         # Dependency Injection (Auth Token Check)
│   │   └── main.py         # Router aggregator
│   ├── core/
│   │   ├── db.py           # Konfigurasi koneksi Database (SQLAlchemy)
│   │   └── security.py     # Logika Hashing Password & JWT
│   ├── schemas/            # Pydantic Models (Validasi Request/Response)
│   ├── services/           # Logika Bisnis (CRUD Profile, Integrasi AI)
│   ├── models.py           # Definisi Tabel Database
│   ├── seeder.py           # Logika pengisian data dummy (Faker)
│   └── main.py             # Entry point aplikasi FastAPI
├── requirements.txt        # Daftar library Python
└── .env                    # File konfigurasi rahasia
```

## Fitur Utama

1.  **Otentikasi & Keamanan**

    - Login/Register menggunakan JWT (JSON Web Token).
    - Password hashing menggunakan Bcrypt.

2.  **Manajemen Profil Kompleks**

    - Satu user memiliki banyak riwayat Pendidikan, Sertifikasi, dan Pengalaman Kerja.
    - Validasi data input menggunakan Pydantic (Enum untuk Dropdown).

3.  **File Handling**

    - Upload Avatar dan Sertifikat (PDF/Image).
    - Penyimpanan file secara lokal di folder `uploads/` dengan akses URL statis.

4.  **Integrasi AI**

    - Chatbot menggunakan Google Gemini 2.5 Flash.
    - Mocking service untuk integrasi dengan sistem eksternal (Tim 3).
