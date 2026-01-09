import datetime
from pathlib import Path
import shutil
import sqlite3
from typing import List, Optional, Dict, Any


class ImageManager:
    """
    A clean, reusable Python interface to manage the 'images' table in SQLite.

    Supports:
    - Creating the table
    - Inserting new images
    - Viewing all records
    - Searching by file name or text
    - Safe operations with error handling
    """

    def __init__(self, db_name: str = "plates.db"):
        self.db_name = db_name
        self.conn = None

    def connect(self):
        """Establish a connection to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_name)
            print(f"✅ Connected to database: {self.db_name}")
        except sqlite3.Error as e:
            print(f"❌ Error connecting to database: {e}")
            raise

    def create_table(self):
        """Create the 'images' table if it doesn't exist."""
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT NOT NULL,
                    fileName TEXT NOT NULL,
                    correctedText TEXT
                )
            """
            )

            cursor.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_filename_unique 
                ON images (fileName);
            """
            )
            self.conn.commit()
            print("✅ Table 'images' created successfully.")
        except sqlite3.Error as e:
            print(f"❌ Error creating table: {e}")
            raise

    def insert(self, text: str, file_name: str, corrected_text: Optional[str] = None):
        """
        Insert a new image record.

        Args:
            text: Text content of the image
            file_name: File name (e.g., 'plate_001.jpg')
            corrected_text: Optional corrected text
        """
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            # Check if filename already exists
            cursor.execute("SELECT 1 FROM images WHERE fileName = ?", (file_name,))
            exists = cursor.fetchone()  # Returns (1,) if exists, None otherwise

            if exists:
                print(f"😅 File '{file_name}' already exists. Skipping insertion.")
                return False
            cursor.execute(
                "INSERT INTO images (text, fileName, correctedText) VALUES (?, ?, ?)",
                (text, file_name, corrected_text),
            )
            self.conn.commit()
            print(f"✅ Inserted: {file_name}")
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"❌ Error inserting record: {e}")
            raise

    def get_all(self) -> List[Dict[str, Any]]:
        """Retrieve all records as a list of dictionaries."""
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM images")
            rows = cursor.fetchall()
            # Convert to dict format
            headers = [description[0] for description in cursor.description]
            return [dict(zip(headers, row)) for row in rows]
        except sqlite3.Error as e:
            print(f"❌ Error reading records: {e}")
            return []

    def search_by_filename(self, filename: str) -> List[Dict[str, Any]]:
        """Search for images by filename (partial match)."""
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT * FROM images WHERE fileName LIKE ?", (f"%{filename}%",)
            )
            rows = cursor.fetchall()
            headers = [description[0] for description in cursor.description]
            return [dict(zip(headers, row)) for row in rows]
        except sqlite3.Error as e:
            print(f"❌ Error searching by filename: {e}")
            return []

    def search_by_text(self, text: str) -> List[Dict[str, Any]]:
        """Search for images by text content (partial match)."""
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM images WHERE text LIKE ?", (f"%{text}%",))
            rows = cursor.fetchall()
            headers = [description[0] for description in cursor.description]
            return [dict(zip(headers, row)) for row in rows]
        except sqlite3.Error as e:
            print(f"❌ Error searching by text: {e}")
            return []

    def delete_by_id(self, image_id: int) -> bool:
        """Delete a record by ID."""
        if self.conn is None:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM images WHERE id = ?", (image_id,))
            if cursor.rowcount == 0:
                print(f"⚠️ No record found with ID {image_id}")
                return False
            self.conn.commit()
            print(f"✅ Deleted record with ID: {image_id}")
            return True
        except sqlite3.Error as e:
            print(f"❌ Error deleting record: {e}")
            return False

    def backup_database(self, backup_dir="backups", backup_prefix="plates_backup"):
        """
        Create a backup of the database with timestamped filename.

        Args:
            backup_dir (str): Directory to save backups (default: 'backups')
            backup_prefix (str): Prefix for backup file (default: 'plates_backup')
        """
        # Ensure backup directory exists
        Path(backup_dir).mkdir(exist_ok=True)

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        backup_filename = f"{backup_prefix}_{timestamp}.db"
        backup_path = Path(backup_dir) / backup_filename

        try:
            # Copy the database file
            shutil.copy2(self.db_name, backup_path)
            print(f"✅ Backup created: {backup_path}")
            return backup_path
        except Exception as e:
            print(f"❌ Error creating backup: {e}")
            return None

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            print("🔌 Database connection closed.")

    def __enter__(self):
        """Support for context manager usage (with statement)."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Close connection when exiting context."""
        self.close()
