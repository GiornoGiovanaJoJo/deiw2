
import sqlite3
import os

# Path to the database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "sql_app.db")

def add_column(cursor, table, column, type_def):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}")
        print(f"Added column {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

def update_db():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Updating database schema...")

    # Category table
    add_column(cursor, "category", "label", "VARCHAR")
    add_column(cursor, "category", "modal_config", "JSON")

    # Projekt table (Note: table name is 'projekt' in models/project.py)
    add_column(cursor, "projekt", "main_image", "VARCHAR")
    add_column(cursor, "projekt", "files", "JSON")

    conn.commit()
    conn.close()
    print("Database update completed.")

if __name__ == "__main__":
    update_db()
