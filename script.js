// script.js

const API_URL = 'https://dein-server.com/api';  // Setze hier die URL deiner API ein

let coinPrice = 10.00;
let codes = {};
let users = {};

document.addEventListener('DOMContentLoaded', () => {
    // Daten vom Server abrufen
    fetch(`${API_URL}/get-data`)
        .then(response => response.json())
        .then(data => {
            coinPrice = data.coinPrice;
            codes = data.codes;
            users = data.users;
            updateUI();
            updateAdminPanel();
        })
        .catch(err => console.error("Fehler beim Laden der Daten:", err));
});

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

        updateUI();
        message.textContent = "Code erfolgreich eingereicht!";
        message.className = "";

        delete codes[codeInput];

        // Daten an den Server senden
        saveData();
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
        loginMessage.textContent = "Erfolgreich eingeloggt!";
        loginMessage.className = "success-message"; // Erfolgsnachricht
    } else {
        loginMessage.textContent = "Ungültige Anmeldeinformationen!";
        loginMessage.className = "error-message"; // Fehlermeldung
    }
}

function addCode() {
    const newCodeInput = document.getElementById("newCodeInput").value;
    const coinValue = parseFloat(document.getElementById("coinValue").value);

    if (newCodeInput && coinValue > 0) {
        codes[newCodeInput] = coinValue;
        updateAdminPanel();
        saveData();
    }
}

function updateAdminPanel() {
    const activeCodes = document.getElementById("activeCodes").getElementsByTagName('tbody')[0];
    activeCodes.innerHTML = "";

    for (const [code, value] of Object.entries(codes)) {
        const newRow = activeCodes.insertRow();
        newRow.insertCell(0).textContent = code;
        newRow.insertCell(1).textContent = value;
        const deleteCell = newRow.insertCell(2);
        deleteCell.innerHTML = `<button onclick="deleteCode('${code}')">Löschen</button>`;
    }
}

function deleteCode(code) {
    delete codes[code];
    updateAdminPanel();
    saveData();
}

function updateUserCoins() {
    const discordName = document.getElementById("userDiscord").value;
    const coinChange = parseFloat(document.getElementById("coinChange").value);

    if (discordName && !isNaN(coinChange)) {
        if (users[discordName]) {
            users[discordName] += coinChange;
        } else {
            users[discordName] = coinChange;
        }
        updateUI();
        saveData();
    }
}

function saveData() {
    // Daten an den Server senden, um sie persistent zu speichern
    fetch(`${API_URL}/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinPrice, codes, users })
    })
    .then(response => response.json())
    .then(data => console.log('Daten erfolgreich gespeichert:', data))
    .catch(err => console.error('Fehler beim Speichern der Daten:', err));
}

function resetAll() {
    codes = {};
    users = {};
    coinPrice = 10.00;
    updateAdminPanel();
    updateUI();
    saveData();
}
