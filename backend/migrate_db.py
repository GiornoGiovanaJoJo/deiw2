import sqlite3

def add_column():
    try:
        conn = sqlite3.connect('sql_app.db')
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables:", [t[0] for t in tables])

        # Try to find the correct table name
        target_table = None
        for t in tables:
            if 'stage' in t[0] and 'project' in t[0]:
                target_table = t[0]
                break
        
        if target_table:
            print(f"Found table: {target_table}")
            cursor.execute(f"PRAGMA table_info({target_table})")
            columns = [info[1] for info in cursor.fetchall()]
            
            if 'client_visible' not in columns:
                print(f"Adding client_visible column to {target_table}...")
                cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN client_visible BOOLEAN DEFAULT 0")
                conn.commit()
                print("Done.")
            else:
                print("Column client_visible already exists.")
        else:
            print("Could not find project stages table.")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
