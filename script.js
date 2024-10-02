// Importiere die benötigten Funktionen von Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

// Firebase-Konfiguration
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

// Variablen
let codes = {};
let users = {};
let coinPrice = 10.00;

// Synchronisation der Daten
onValue(ref(database, 'codes'), (snapshot) => {
  codes = snapshot.val() || {};
});

onValue(ref(database, 'users'), (snapshot) => {
  users = snapshot.val() || {};
  updateUI();
});

onValue(ref(database, 'coinPrice'), (snapshot) => {
  coinPrice = snapshot.val() || 10.00;
  document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
});

// Funktionen
function submitCode() {
    const codeInput = document.getElementById("codeInput").value;
    const discordInput = document.getElementById("discordInput").value;
    const message = document.getElementById("message");

    if (codeInput.length > 0 && codeInput.length <= 8 && codes[codeInput]) {
        const coinValue = codes[codeInput];
        coinPrice *= 1 + (0.02 * coinValue);

        if (users[discordInput]) {
            users[discordInput] += coinValue;
        } else {
            users[discordInput] = coinValue;
        }

        message.textContent = "Code erfolgreich eingereicht!";
        message.className = "";

        delete codes[codeInput];

        // Firebase Daten aktualisieren
        updateDatabase();
    } else {
        message.textContent = "Ungültiger Code oder Discord-Name!";
        message.className = "error-message";
    }

    document.getElementById("codeInput").value = "";
    document.getElementById("discordInput").value = "";
}

function updateDatabase() {
    set(ref(database, 'codes'), codes);
    set(ref(database, 'users'), users);
    set(ref(database, 'coinPrice'), coinPrice);
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
        loginMessage.textContent = "Erfolgreich eingeloggt!";
        loginMessage.className = "success-message"; // Erfolgsnachricht
    } else {
        loginMessage.textContent = "Ungültige Anmeldeinformationen!";
        loginMessage.className = "error-message"; // Fehlermeldung
    }
}

function changeCoinPrice() {
    const newPrice = parseFloat(document.getElementById("newCoinPrice").value);
    if (!isNaN(newPrice)) {
        coinPrice = newPrice;
        updateDatabase();
    }
}

function addCode() {
    const newCode = document.getElementById("newCodeInput").value;
    const value = parseInt(document.getElementById("coinValue").value);
    if (newCode.length <= 8 && !codes[newCode] && value > 0) {
        codes[newCode] = value;
        updateDatabase();
    }
}

function updateUserCoins() {
    const userDiscord = document.getElementById("userDiscord").value;
    const coinChange = parseInt(document.getElementById("coinChange").value);
    if (users[userDiscord] !== undefined) {
        users[userDiscord] += coinChange;
        updateDatabase();
    }
}

function resetAll() {
    // Hier kannst du die Logik für das Zurücksetzen aller Daten implementieren
}
