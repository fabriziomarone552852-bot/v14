import sqlite3
conn = sqlite3.connect('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14\\backend\\smartagenda.db')
c = conn.cursor()
c.execute("SELECT id, username FROM users")
print("USERS:", c.fetchall())

c.execute("SELECT requester_id, addressee_id, status FROM friendships")
print("FRIENDSHIPS:", c.fetchall())

c.execute("SELECT user_id, series_tmdb_id, review_visibility FROM user_series_tracking")
print("TRACKING:", c.fetchall())
