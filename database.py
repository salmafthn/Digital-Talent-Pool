import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Mohon isi SUPABASE_URL dan SUPABASE_KEY di file .env")

supabase: Client = create_client(url, key)