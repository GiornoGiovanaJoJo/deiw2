import sqlite3
import os

DB_PATH = 'sql_app.db'

def add_stage_columns():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check existing columns
        # Note: Table name might be 'project_stage' or 'projectstage' or 'project_stages' depending on SQLAlchemy model __tablename__
        # but usually it matches class name snake_cased if not specified.
        # Let's check table list first.
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tables: {tables}")
        
        target_table = None
        if 'project_stage' in tables:
            target_table = 'project_stage'
        elif 'projectstage' in tables:
            target_table = 'projectstage'
        elif 'project_stages' in tables:
            target_table = 'project_stages'
            
        if not target_table:
            print("Could not find project_stage table.")
            return

        cursor.execute(f"PRAGMA table_info({target_table})")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Existing columns in {target_table}: {columns}")

        # Add 'status'
        if 'status' not in columns:
            print("Adding 'status' column...")
            cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN status VARCHAR DEFAULT 'Geplant'")

        # Add 'order'
        if 'order' not in columns:
            print("Adding 'order' column...")
            cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN 'order' INTEGER DEFAULT 0")

        # Add 'client_visible'
        if 'client_visible' not in columns:
            print("Adding 'client_visible' column...")
            cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN client_visible BOOLEAN DEFAULT 0")

        conn.commit()
        print("Schema update completed successfully.")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_stage_columns()
