import sqlite3
import os

DB_PATH = 'sql_app.db'

def add_columns():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check existing columns
        cursor.execute("PRAGMA table_info(projekt)")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Existing columns: {columns}")

        # Add 'priority'
        if 'priority' not in columns:
            print("Adding 'priority' column...")
            cursor.execute("ALTER TABLE projekt ADD COLUMN priority VARCHAR DEFAULT 'Mittel'")

        # Add 'address'
        if 'address' not in columns:
            print("Adding 'address' column...")
            cursor.execute("ALTER TABLE projekt ADD COLUMN address VARCHAR")

        # Add 'photos'
        if 'photos' not in columns:
            print("Adding 'photos' column...")
            cursor.execute("ALTER TABLE projekt ADD COLUMN photos JSON DEFAULT '[]'")

        # Add 'projektleiter_id'
        if 'projektleiter_id' not in columns:
            print("Adding 'projektleiter_id' column...")
            cursor.execute("ALTER TABLE projekt ADD COLUMN projektleiter_id INTEGER REFERENCES user(id)")
            
        conn.commit()
        print("Schema update completed successfully.")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_columns()
