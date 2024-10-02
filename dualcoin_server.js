const express = require('express');
const mysql = require('mysql');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dualcoin'
});

db.connect(err => {
    if (err) {
        console.error('Datenbankverbindung fehlgeschlagen: ', err);
    } else {
        console.log('Mit der Datenbank verbunden');
    }
});

// Registrieren
app.post('/register', (req, res) => {
    const { username, discord, password } = req.body;  // Kein vollständiger Name
    const transferCode = generateTransferCode();

    const query = 'INSERT INTO users (username, discord, password, coins, transferCode) VALUES (?, ?, ?, 0, ?)';
    db.query(query, [username, discord, password, transferCode], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Datenbankfehler', success: false });
        }
        res.status(200).json({ message: 'Registrierung erfolgreich', success: true });
    });
});

// Anmelden
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Anmeldedaten sind falsch', success: false });
        }
        res.status(200).json({ message: 'Anmeldung erfolgreich', success: true, user: results[0] });
    });
});

function generateTransferCode() {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-stellige Zahl generieren
}

app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});
