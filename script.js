// Firebase SDKs einfügen
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Deine Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyDGHc-MC0XZkZBPdhypCHoqmqTmHhhK5Ig",
    authDomain: "dualis-company-chain.firebaseapp.com",
    databaseURL: "https://dualis-company-chain-default-rtdb.firebaseio.com",
    projectId: "dualis-company-chain",
    storageBucket: "dualis-company-chain.appspot.com",
    messagingSenderId: "521000433736",
    appId: "1:521000433736:web:c5c60acd15c0d1b5f6c07d",
    measurementId: "G-JEYQSXL8Z9"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let codes = JSON.parse(localStorage.getItem('codes')) || {};
let users = {};
let coinPrice = parseFloat(localStorage.getItem('coinPrice')) || 10.00;

// Funktion zum Speichern des Leaderboards in Firebase
function saveLeaderboardData() {
    const leaderboardRef = ref(database, 'leaderboard/');
    const leaderboardData = {
        users: users
    };

    set(leaderboardRef, leaderboardData)
        .then(() => {
            console.log('Leaderboard erfolgreich gespeichert!');
        })
        .catch((error) => {
            console.error('Fehler beim Speichern des Leaderboards: ', error);
        });
}

// Funktion zum Laden des Leaderboards von Firebase
function loadLeaderboardData() {
    const leaderboardRef = ref(database, 'leaderboard/');

    get(leaderboardRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                users = snapshot.val().users;
                updateUI(); // Aktualisiere das UI mit den geladenen Daten
            } else {
                console.log('Keine Daten vorhanden');
            }
        })
        .catch((error) => {
            console.error('Fehler beim Abrufen der Daten: ', error);
        });
}

function submitCode() {
    const codeInput = document.getElementById("codeInput").value;
    const discordInput = document.getElementById("discordInput").value;
    const message = document.getElementById("message");

    if (codeInput.length > 0 && codeInput.length <= 8 && codes[codeInput]) {
        const coinValue = codes[codeInput];

        if (users[discordInput]) {
            users[discordInput] += coinValue;
        } else {
            users[discordInput] = coinValue;
        }

        updateUI();
        message.textContent = "Code erfolgreich eingereicht!";
        message.className = "";

        delete codes[codeInput];
        localStorage.setItem('codes', JSON.stringify(codes));
        saveLeaderboardData(); // Speichern nach dem Aktualisieren
    } else {
        message.textContent = "Ungültiger Code oder Discord-Name!";
        message.className = "error-message";
    }

    document.getElementById("codeInput").value = "";
    document.getElementById("discordInput").value = "";
}

function updateUI() {
    const leaderboard = document.getElementById("leaderboard").getElementsByTagName('tbody')[0];
    leaderboard.innerHTML = "";

    for (const [name, coins] of Object.entries(users)) {
        const newRow = leaderboard.insertRow();
        newRow.insertCell(0).textContent = name;
        newRow.insertCell(1).textContent = coins;
    }

    document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
}

function login() {
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;
    const adminPanel = document.getElementById("adminPanel");
    const loginMessage = document.getElementById("loginMessage");

    // Überprüfen, ob die Anmeldedaten korrekt sind
    if (username === "Dualis" && password === "28102006") {
        adminPanel.style.display = "block"; // Zeigt das Admin-Panel an
        loadLeaderboardData(); // Lade die Leaderboard-Daten
        loginMessage.textContent = "Erfolgreich eingeloggt!";
        loginMessage.className = "success-message"; // Erfolgsnachricht
    } else {
        loginMessage.textContent = "Ungültige Anmeldeinformationen!";
        loginMessage.className = "error-message"; // Fehlermeldung
    }
}

// Die folgenden Funktionen fügen Codes hinzu und aktualisieren die Coins
function addCode() {
    const newCodeInput = document.getElementById("newCodeInput").value;
    const coinValue = parseFloat(document.getElementById("coinValue").value);

    if (newCodeInput.length > 0 && newCodeInput.length <= 8 && !codes[newCodeInput]) {
        codes[newCodeInput] = coinValue;
        localStorage.setItem('codes', JSON.stringify(codes));
        alert("Neuer Code hinzugefügt!");
    } else {
        alert("Ungültiger Code oder der Code existiert bereits!");
    }
    document.getElementById("newCodeInput").value = "";
    document.getElementById("coinValue").value = "";
}

function changeCoinPrice() {
    const newPrice = parseFloat(document.getElementById("newCoinPrice").value);
    if (!isNaN(newPrice) && newPrice > 0) {
        coinPrice = newPrice;
        localStorage.setItem('coinPrice', coinPrice);
        document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
        alert("Coin-Preis erfolgreich geändert!");
        saveLeaderboardData(); // Speichern der Coin-Preisdaten
    } else {
        alert("Bitte geben Sie einen gültigen Preis ein.");
    }
    document.getElementById("newCoinPrice").value = "";
}

function updateUserCoins() {
    const userDiscord = document.getElementById("userDiscord").value;
    const coinChange = parseFloat(document.getElementById("coinChange").value);

    if (users[userDiscord]) {
        users[userDiscord] += coinChange;
        if (users[userDiscord] < 0) {
            users[userDiscord] = 0; // Verhindern, dass die Coins negativ werden
        }
        updateUI();
        saveLeaderboardData(); // Speichern der aktualisierten Coins
        alert("Coins erfolgreich aktualisiert!");
    } else {
        alert("Nutzer nicht gefunden!");
    }
    document.getElementById("userDiscord").value = "";
    document.getElementById("coinChange").value = "";
}

function resetAll() {
    if (confirm("Möchten Sie wirklich alle Daten zurücksetzen?")) {
        users = {};
        codes = {};
        localStorage.removeItem('codes');
        localStorage.removeItem('coinPrice');
        coinPrice = 10.00; // Zurücksetzen auf den Standardpreis
        localStorage.setItem('coinPrice', coinPrice);
        updateUI();
        saveLeaderboardData(); // Leeres Leaderboard speichern
        alert("Alle Daten wurden zurückgesetzt.");
    }
}

// Beim Laden der Seite das Leaderboard abrufen
loadLeaderboardData();
