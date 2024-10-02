// server.js (Backend mit Node.js und Express)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// MongoDB-Verbindung
mongoose.connect('mongodb://localhost/dual-coin', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mongoose Schema und Model
const DataSchema = new mongoose.Schema({
    coinPrice: Number,
    codes: Object,
    users: Object
});

const Data = mongoose.model('Data', DataSchema);

// Initiale Daten setzen
let currentData = {
    coinPrice: 10.00,
    codes: {},
    users: {}
};

// Daten von der Datenbank laden
app.get('/api/get-data', (req, res) => {
    Data.findOne({}, (err, data) => {
        if (data) {
            currentData = data;
            res.json(currentData);
        } else {
            res.json(currentData);
        }
    });
});

// Daten speichern
app.post('/api/save-data', (req, res) => {
    const { coinPrice, codes, users } = req.body;
    currentData = { coinPrice, codes, users };

    Data.findOneAndUpdate({}, currentData, { upsert: true }, (err, data) => {
        if (err) return res.status(500).send('Fehler beim Speichern');
        res.json({ message: 'Daten erfolgreich gespeichert' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
