import sqlite3
import os


import sqlite3
import os
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


# ✅ Example usage (you can run this in a script or import)
if __name__ == "__main__":
    print("🚀 Starting Image Manager Demo")

    # Create and manage the database
    with ImageManager() as manager:
        # Create table
        manager.create_table()

        # Insert sample data
        # manager.insert("This is a plate", "plate_001.jpg", "Corrected text")
        # manager.insert("No plate found", "plate_002.jpg", None)
        # manager.insert("High contrast image", "plate_003.jpg", "Auto-corrected text")

        # View all records
        records = manager.get_all()
        print("\n📋 All records:")
        for record in records:
            print(record)

        # Search example
        print("\n🔍 Search by filename 'plate_001':")
        result = manager.search_by_filename("plate_001")
        for r in result:
            print(r)

        # Search by text
        print("\n🔍 Search by text 'plate':")
        result = manager.search_by_text("plate")
        for r in result:
            print(r)

        # Delete a record (e.g., ID = 1)
        manager.delete_by_id(1)
