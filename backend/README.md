# DTP Backend API

Backend ini dibangun menggunakan Python (FastAPI) dan Supabase sebagai database. Sistem ini masih sebatas testing dan mocking untuk logika profil pengguna, mock chatbot AI, asesmen kompetensi, dan dashboard rekomendasi.

---

## Prasyarat

Pastikan di laptop sudah terinstall:

- Python 3.10 atau yang lebih baru (3.12 recommended)
- pip (Python package installer)

## Cara Install dan Menjalankan

Ikuti langkah berikut untuk menjalankan server di local:

1. Clone atau download repository ini

2. Buat virtual environment (rekomendasi agar library tidak bentrok):
   python -m venv venv

3. Aktifkan virtual environment:

   - Windows (CMD): venv\Scripts\activate
   - Windows (PowerShell): .\venv\Scripts\Activate.ps1
   - Mac/Linux: source venv/bin/activate

4. Install library yang dibutuhkan:
   pip install fastapi uvicorn supabase python-dotenv pydantic google-genai

5. Konfigurasi Environment Variable:

   - Buat file baru bernama .env
   - Copy isi dari file .env.example ke dalam .env
   - Isi SUPABASE_URL, SUPABASE_KEY, dan GEMINI_API_KEY sesuai kredensial proyek.
   - Pastikan file bank_soal.json dan recommendations.json sudah ada di folder root.

6. Jalankan Server:
   uvicorn main:app --reload

7. Akses Dokumentasi API:
   Buka browser dan akses alamat berikut untuk melihat Swagger UI:
   http://127.0.0.1:8000/docs

## Struktur Folder

- main.py: Entry point aplikasi, berisi seluruh endpoint API
- database.py: Konfigurasi koneksi ke Supabase client
- schemas.py: Model data Pydantic untuk validasi request dan response
- bank_soal.json: Database statis untuk soal ujian (mocking)
- recommendations.json: Database statis untuk rekomendasi lowongan dan modul belajar
- .env: File konfigurasi kredensial (jangan di-upload ke git)

---

## Catatan

- Backend berjalan di port 8000 secara default.
- Untuk endpoint chat menggunakan model gemini-2.5-flash
- Endpoint profil membutuhkan User UID yang valid dari tabel auth.users Supabase
- Jika ada error 'module not found', pastikan virtual environment sudah aktif sebelum menjalankan pip install
