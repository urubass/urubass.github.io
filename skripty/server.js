const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database('database.db');

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    recipeId INTEGER NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  db.run(`DROP TABLE IF EXISTS ratings`);

  db.run(`CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    recipeId INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, recipeId)
  )`);
});

// Registrace
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Chyba při registraci');
      }
      const userId = this.lastID;
      res.json({ userId });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Chyba na straně serveru');
  }
});

// Přihlášení
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Chyba na straně serveru');
    }

    if (!row) {
      return res.status(401).send('Neplatné přihlašovací údaje');
    }

    try {
      const isValidPassword = await bcrypt.compare(password, row.password);

      if (isValidPassword) {
        req.session.userId = row.id;
        res.json({ userId: row.id });
      } else {
        res.status(401).send('Neplatné přihlašovací údaje');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Chyba na straně serveru');
    }
  });
});

// Odhlášení
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Chyba při odhlašování:', err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

// Přidání komentáře
app.post('/comments', async (req, res) => {
  const { userId, recipeId, comment } = req.body;

  db.run(`INSERT INTO comments (userId, recipeId, comment) VALUES (?, ?, ?)`, [userId, recipeId, comment], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při přidávání komentáře');
    }
    console.log(`Nový komentář přidán s ID: ${this.lastID}`);
    res.sendStatus(200);
  });
});

// Získání komentářů pro daný recept
app.get('/comments', (req, res) => {
  const recipeId = req.query.recipeId;

  db.all(`SELECT c.id, c.comment, u.username 
          FROM comments c
          JOIN users u ON c.userId = u.id
          WHERE c.recipeId = ?`, [recipeId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Chyba na straně serveru');
    }
    res.json(rows);
  });
});

app.post('/ratings', async (req, res) => {
  const { userId, recipeId, rating } = req.body;

  if (!recipeId || !userId) {
    console.error('Chybějící recipeId nebo userId při ukládání hodnocení');
    return res.status(400).send('Chybějící recipeId nebo userId');
  }

  db.run(`
    INSERT INTO ratings (userId, recipeId, rating)
    VALUES (?, ?, ?)
    ON CONFLICT(userId, recipeId) DO UPDATE SET rating = ?
  `, [userId, recipeId, rating, rating], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při ukládání hodnocení');
    }
    res.sendStatus(200);
  });
});

// Získání průměrného hodnocení a počtu hodnocení pro každý recept
app.get('/recipeRatings', (req, res) => {
  db.all(`
    SELECT recipeId, AVG(rating) AS averageRating, COUNT(*) AS ratingCount
    FROM ratings
    GROUP BY recipeId
  `, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při načítání hodnocení receptů');
    }
    res.json(rows);
  });
});

// Získání hodnocení uživatele pro daný recept
app.get('/ratings', (req, res) => {
  const { recipeId, userId } = req.query;

  db.all(`SELECT * FROM ratings WHERE recipeId = ? AND userId = ?`, [recipeId, userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při načítání hodnocení uživatele');
    }
    res.json(rows);
  });
});  

// Aktualizace průměrného hodnocení receptu
app.put('/updateRecipeRating', (req, res) => {
  const { recipeId, newRating } = req.body;

  db.run(`
    INSERT INTO ratings (recipeId, rating) VALUES (?, ?)
    ON CONFLICT (recipeId) DO UPDATE SET rating = ?
  `, [parseInt(recipeId), newRating, newRating], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při aktualizaci hodnocení receptu');
    }
    res.sendStatus(200);
  });
});

// Získání průměrného hodnocení pro daný recept
app.get('/recipeAverageRating', (req, res) => {
  const recipeId = req.query.recipeId;

  db.get(`
    SELECT AVG(rating) AS averageRating
    FROM ratings
    WHERE recipeId = ?
  `, [recipeId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Chyba při načítání průměrného hodnocení receptu');
    }
    res.json({ averageRating: row.averageRating || 0 });
  });
});