// Number: 3

const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('database.db');

// Create tables if they don't exist
db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY(categoryId) REFERENCES categories(id)
)`);

// Seed the database with sample data
db.serialize(() => {
    const category = 'Sports';
    const news = [
        { title: 'News 1', content: 'Content 1' },
        { title: 'News 2', content: 'Content 2' },
        { title: 'News 3', content: 'Content 3' }
    ];

    db.run('INSERT INTO categories (name) VALUES (?)', category, function (err) {
        if (err) {
            console.error(err);
        } else {
            const categoryId = this.lastID;
            news.forEach(({ title, content }) => {
                db.run('INSERT INTO news (categoryId, title, content) VALUES (?, ?, ?)', categoryId, title, content, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        }
    });
});

// Define routes
app.get('/news/sports', (req, res) => {
    db.all('SELECT * FROM news WHERE categoryId = (SELECT id FROM categories WHERE name = ?)', 'Sports', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// Start the server
const port = 4005;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


