import sqlite3, { Database } from 'sqlite3'
import { Image } from './types'
//const sqlite = new sqlite3()
// const db = new sqlite3.Database('./plates.db', (err) => {
//   if (err) {
//     console.error('❌ Failed to connect to database:', err)
//   } else {
//     console.log('✅ Connected to SQLite database: plates.db')
//   }
// })

export class SQLiteImageManager {
  db: Database //| null = null
  constructor(dbPath = './plates.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to connect to database:', err)
      } else {
        console.log('✅ Connected to SQLite database:', dbPath)
      }
    })
  }

  // === 1. Create Table (if not exists) ===
  createTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            fileName TEXT NOT NULL,
            correctedText TEXT
        );
    `
    this.db?.run(query, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err)
      } else {
        console.log("✅ Table 'images' created or already exists.")
      }
    })
  }

  // === 2. Insert a new image record ===
  insertImage({ text, fileName, correctedText = '' }: Image) {
    const query =
      'INSERT INTO images (text, fileName, correctedText) VALUES (?, ?, ?)'
    this.db.run(query, [text, fileName, correctedText], function (err) {
      if (err) {
        console.error('❌ Error inserting record:', err)
      } else {
        console.log(`✅ Inserted record with ID: ${this.lastID}`)
      }
    })
  }

  // === 3. Read all records ===
  getAllImages(): Promise<Image[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images'
      this.db.all(query, [], (err, rows: Image[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // === 4. Search by filename (partial match) ===
  searchByFilename(filename: string) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE fileName LIKE ?'
      this.db.all(query, [`%${filename}%`], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // === 5. Search by text (partial match) ===
  searchByText(text: string) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE text LIKE ?'
      this.db.all(query, [`%${text}%`], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  getImgById(id: string): Promise<Image> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE id = ?'
      this.db.all(query, [id], (err, rows: Image[]) => {
        if (rows.length == 0) {
          reject('no row found')
        } else if (err) {
          reject(err)
        } else {
          resolve(rows[0])
        }
      })
    })
  }
  // === 6. Delete by ID ===
  deleteById(imageId: number) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM images WHERE id = ?'
      this.db.run(query, [imageId], function (err) {
        if (err) {
          reject(err)
        } else if (this.changes === 0) {
          console.log(`⚠️ No record found with ID: ${imageId}`)
          resolve(false)
        } else {
          console.log(`✅ Deleted record with ID: ${imageId}`)
          resolve(true)
        }
      })
    })
  }

  // === 7. Close connection ===
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err)
      } else {
        console.log('🔌 Database connection closed.')
      }
    })
  }

  // === 7. UPDATE a record by ID ===
  updateImage({
    text,
    fileName,
    correctedText = '',
    id,
    user
  }: Image): Promise<Image> {
    return new Promise((resolve, reject) => {
      const query =
        'UPDATE images SET text = ?, fileName = ?, correctedText = ? , user = ? WHERE id = ?'
      this.db.run(
        query,
        [text, fileName, correctedText, user, id],
        function (err) {
          if (err) {
            reject(err)
          } else if (this.changes === 0) {
            console.log(`⚠️ No record found with ID: ${id}`)
            reject(err)
          } else {
            console.log(`✅ Updated record with ID: ${id}`)
            resolve({ text, fileName, correctedText, id, user })
          }
        }
      )
    })
  }
}

// // === MAIN: Example Usage ===
// ;(async () => {
//   console.log('\n🚀 Starting Node.js Image Manager Demo')

//   // 1. Create table (only once)
//   createTable()

//   // 3. Read all records
//   console.log('\n📋 All records:')
//   const all = await getAllImages()
//   all.forEach((img) => {
//     console.log(
//       `ID: ${img.id}, Text: '${img.text}', File: '${
//         img.fileName
//       }', Corrected: '${img.correctedText || 'None'}'`
//     )
//   })

//   // 4. Search by filename
//   console.log("\n🔍 Search by filename 'plate_001':")
//   const result1 = await searchByFilename('plate_001')
//   result1.forEach((img) => console.log(img))

//   // 5. Search by text
//   console.log("\n🔍 Search by text 'plate':")
//   const result2 = await searchByText('plate')
//   result2.forEach((img) => console.log(img))

//   // 6. Delete a record (e.g., ID = 1)
//   await deleteById(1)

//   // 7. Close connection
//   close()
// })()
