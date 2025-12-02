from datetime import datetime
import os
import bcrypt
import requests

SUPABASE_URL = os.getenv('SUPABASE_URL')  # e.g. https://xxxxx.supabase.co
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')  # public anon key
TABLE = 'users'
BASE_REST = f"{SUPABASE_URL}/rest/v1/{TABLE}" if SUPABASE_URL else None
HEADERS = {
    'apikey': SUPABASE_ANON_KEY or '',
    'Authorization': f"Bearer {SUPABASE_ANON_KEY}" if SUPABASE_ANON_KEY else '',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

class User:
    @staticmethod
    def _ensure():
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise RuntimeError("Supabase env vars SUPABASE_URL and SUPABASE_ANON_KEY must be set")

    @staticmethod
    def create(name, email, password, role='user'):
        User._ensure()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        payload = {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'role': role,
            'created_at': datetime.utcnow().isoformat()
        }
        resp = requests.post(BASE_REST, json=payload, headers=HEADERS)
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase insert failed: {resp.text}")
        return resp.json()[0]

    @staticmethod
    def find_by_email(email):
        User._ensure()
        resp = requests.get(f"{BASE_REST}?email=eq.{email}", headers=HEADERS)
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase select failed: {resp.text}")
        data = resp.json()
        return data[0] if data else None

    @staticmethod
    def find_by_id(user_id):
        User._ensure()
        resp = requests.get(f"{BASE_REST}?id=eq.{user_id}", headers=HEADERS)
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase select failed: {resp.text}")
        data = resp.json()
        return data[0] if data else None

    @staticmethod
    def get_all():
        User._ensure()
        resp = requests.get(f"{BASE_REST}?order=created_at.desc", headers=HEADERS)
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase select failed: {resp.text}")
        return resp.json()

    @staticmethod
    def delete(user_id):
        User._ensure()
        delete_url = f"{BASE_REST}?id=eq.{user_id}"
        resp = requests.delete(delete_url, headers={**HEADERS, 'Prefer': 'return=representation'})
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase delete failed: {resp.text}")
        return len(resp.json()) > 0

    @staticmethod
    def verify_password(stored_hash, password):
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
