
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
    const { username, discord, realName, password } = req.body;
    const transferCode = generateTransferCode();
    
    const query = 'INSERT INTO users (username, discord, realName, password, coins, transferCode) VALUES (?, ?, ?, ?, 0, ?)';
    db.query(query, [username, discord, realName, password, transferCode], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Datenbankfehler' });
        }
        res.status(200).json({ message: 'Registrierung erfolgreich' });
    });
});

// Anmelden
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Anmeldedaten sind falsch' });
        }
        res.status(200).json({ message: 'Anmeldung erfolgreich', user: results[0] });
    });
});

function generateTransferCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// Überweisung durchführen
app.post('/transfer', (req, res) => {
    const { senderUsername, transferCode, transferAmount } = req.body;

    // Überprüfen, ob der Sender genug Coins hat
    const checkCoinsQuery = 'SELECT coins FROM users WHERE username = ?';
    db.query(checkCoinsQuery, [senderUsername], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ message: 'Fehler beim Abrufen der Sender-Daten' });
        }

        const senderCoins = results[0].coins;
        if (senderCoins < transferAmount) {
            return res.status(400).json({ message: 'Nicht genug Coins vorhanden' });
        }

        // Überprüfen, ob der Empfänger existiert
        const checkRecipientQuery = 'SELECT username FROM users WHERE transferCode = ?';
        db.query(checkRecipientQuery, [transferCode], (err, recipientResults) => {
            if (err || recipientResults.length === 0) {
                return res.status(404).json({ message: 'Empfänger nicht gefunden' });
            }

            const recipientUsername = recipientResults[0].username;

            // Überweisung: Coins vom Sender abziehen und dem Empfänger gutschreiben
            const updateSenderQuery = 'UPDATE users SET coins = coins - ? WHERE username = ?';
            const updateRecipientQuery = 'UPDATE users SET coins = coins + ? WHERE username = ?';

            db.query(updateSenderQuery, [transferAmount, senderUsername], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Fehler beim Abziehen der Coins vom Sender' });
                }

                db.query(updateRecipientQuery, [transferAmount, recipientUsername], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Fehler beim Gutschreiben der Coins beim Empfänger' });
                    }

                    res.status(200).json({ message: 'Überweisung erfolgreich durchgeführt' });
                });
            });
        });
    });
});

// Leaderboard abrufen
app.get('/leaderboard', (req, res) => {
    const query = 'SELECT username, coins, transferCode FROM users ORDER BY coins DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Fehler beim Abrufen des Leaderboards' });
        }
        res.status(200).json(results);
    });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
