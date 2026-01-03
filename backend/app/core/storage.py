from minio import Minio
import os
from dotenv import load_dotenv

load_dotenv()
 
is_secure = os.getenv("MINIO_SECURE", "False").lower() == "true"

minio_client = Minio(
    os.getenv("MINIO_ENDPOINT"),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=is_secure
)

bucket_name = os.getenv("MINIO_BUCKET", "dtp-upload")
 
try:
    if not minio_client.bucket_exists(bucket_name):
        print(f"Bucket {bucket_name} tidak ditemukan, membuat baru...")
        minio_client.make_bucket(bucket_name)
except Exception as e:
    print(f"⚠️ Warning: Gagal konek ke MinIO. Pastikan VPN/SSH Tunnel aktif jika di lokal. Error: {e}")