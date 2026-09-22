import psycopg
import sys

try:
    with psycopg.connect("postgresql://PostGre:Password-Robusta@192.168.11.20:5432/test-smart") as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT email FROM users LIMIT 1;")
            user = cur.fetchone()
            print("User email:", user[0] if user else "None")
except Exception as e:
    print("Error:", e)
