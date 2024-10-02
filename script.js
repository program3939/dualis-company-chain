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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Globale Variablen
let codes = {};
let users = {};
let coinPrice = 10.00;

// Führt den Code aus, um die Daten aus Firebase zu laden
window.onload = function() {
    loadData();
}

// Daten aus Firebase laden
function loadData() {
    // Leaderboard-Daten laden
    const usersRef = database.ref('users');
    usersRef.on('value', (snapshot) => {
        users = snapshot.val() || {};
        updateLeaderboard();
    });

    // Codes laden
    const codesRef = database.ref('codes');
    codesRef.on('value', (snapshot) => {
        codes = snapshot.val() || {};
        updateActiveCodes();
    });

    // Coin-Preis laden
    const priceRef = database.ref('coinPrice');
    priceRef.on('value', (snapshot) => {
        coinPrice = snapshot.val() || 10.00;
        document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
    });
}

// Code einreichen
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

        // Update Coin-Preis
        coinPrice *= 1 + (0.02 * coinValue);

        // Speichern der Änderungen in Firebase
        database.ref('users').set(users);
        database.ref('coinPrice').set(coinPrice);
        delete codes[codeInput];
        database.ref('codes').set(codes);

        message.textContent = "Code erfolgreich eingereicht!";
        message.className = "";

        updateUI(discordInput, codeInput);
    } else {
        message.textContent = "Ungültiger Code oder Discord-Name!";
        message.className = "error-message";
    }

    document.getElementById("codeInput").value = "";
    document.getElementById("discordInput").value = "";
}

// UI aktualisieren
function updateUI(discordName, code) {
    updateLeaderboard();
    document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
}

// Leaderboard aktualisieren
function updateLeaderboard() {
    const leaderboard = document.getElementById("leaderboard").getElementsByTagName('tbody')[0];
    leaderboard.innerHTML = "";

    for (const [name, coins] of Object.entries(users)) {
        const newRow = leaderboard.insertRow();
        newRow.insertCell(0).textContent = name;
        newRow.insertCell(1).textContent = coins;
    }
}

// Admin-Login
function login() {
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;
    const adminPanel = document.getElementById("adminPanel");
    const loginMessage = document.getElementById("loginMessage");

    if (username === "Dualis" && password === "28102006") {
        adminPanel.style.display = "block"; 
        updateAdminPanel();
        loginMessage.textContent = "Erfolgreich eingeloggt!";
        loginMessage.className = "success-message"; 
    } else {
        loginMessage.textContent = "Ungültige Anmeldeinformationen!";
        loginMessage.className = "error-message"; 
    }
}

// Neuen Code hinzufügen
function addCode() {
    const newCodeInput = document.getElementById("newCodeInput").value;
    const coinValue = parseFloat(document.getElementById("coinValue").value);
    if (newCodeInput && coinValue > 0) {
        codes[newCodeInput] = coinValue;
        database.ref('codes').set(codes);
        updateActiveCodes();
        document.getElementById("newCodeInput").value = "";
        document.getElementById("coinValue").value = "";
    }
}

// Aktive Codes aktualisieren
function updateActiveCodes() {
    const activeCodesTable = document.getElementById("activeCodes").getElementsByTagName('tbody')[0];
    activeCodesTable.innerHTML = "";

    for (const [code, value] of Object.entries(codes)) {
        const newRow = activeCodesTable.insertRow();
        newRow.insertCell(0).textContent = code;
        newRow.insertCell(1).textContent = value;
        const actionCell = newRow.insertCell(2);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = () => {
            delete codes[code];
            database.ref('codes').set(codes);
            updateActiveCodes();
        };
        actionCell.appendChild(deleteButton);
    }
}

// Coin-Preis ändern
function changeCoinPrice() {
    const newPrice = parseFloat(document.getElementById("newCoinPrice").value);
    if (newPrice > 0) {
        coinPrice = newPrice;
        database.ref('coinPrice').set(coinPrice);
        document.getElementById("newCoinPrice").value = "";
    }
}

// Benutzer-Coins aktualisieren
function updateUserCoins() {
    const discordName = document.getElementById("userDiscord").value;
    const coinChange = parseInt(document.getElementById("coinChange").value);

    if (users[discordName] && coinChange) {
        users[discordName] += coinChange;
        database.ref('users').set(users);
        updateLeaderboard();
        document.getElementById("userDiscord").value = "";
        document.getElementById("coinChange").value = "";
    }
}

// Alle Daten zurücksetzen
function resetAll() {
    database.ref('users').set({});
    database.ref('codes').set({});
    database.ref('coinPrice').set(10.00);
}
