// script.js

let codes = JSON.parse(localStorage.getItem('codes')) || {};
let users = JSON.parse(localStorage.getItem('users')) || {};
let coinPrice = parseFloat(localStorage.getItem('coinPrice')) || 10.00;
let lastCodeTime = parseInt(localStorage.getItem('lastCodeTime')) || Date.now();

function submitCode() {
    const codeInput = document.getElementById("codeInput").value;
    const discordInput = document.getElementById("discordInput").value;
    const message = document.getElementById("message");

    if (codeInput.length > 0 && codeInput.length <= 8 && codes[codeInput]) {
        const coinValue = codes[codeInput];
        lastCodeTime = Date.now();

        coinPrice *= 1 + (0.02 * coinValue);

        if (users[discordInput]) {
            users[discordInput] += coinValue;
        } else {
            users[discordInput] = coinValue;
        }

        updateUI(discordInput, codeInput);
        message.textContent = "Code erfolgreich eingereicht!";
        message.className = "";

        delete codes[codeInput];

    } else {
        message.textContent = "Ungültiger Code oder Discord-Name!";
        message.className = "error-message";
    }

    document.getElementById("codeInput").value = "";
    document.getElementById("discordInput").value = "";

    localStorage.setItem('codes', JSON.stringify(codes));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('coinPrice', coinPrice);
    localStorage.setItem('lastCodeTime', lastCodeTime);
}

function updateUI(discordName, code) {
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
        updateAdminPanel(); // Aktualisiert das Admin-Panel
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
        document.getElementById("coinPrice").textContent = coinPrice.toFixed(2) + " $";
        localStorage.setItem('coinPrice', coinPrice);
    }
}

function addCode() {
    const newCodeInput = document.getElementById("newCodeInput").value;
    const coinValue = parseFloat(document.getElementById("coinValue").value);

    if (newCodeInput && coinValue > 0) {
        codes[newCodeInput] = coinValue;
        localStorage.setItem('codes', JSON.stringify(codes));
        updateAdminPanel();
    }
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
        localStorage.setItem('users', JSON.stringify(users));
        updateUI();
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
    localStorage.setItem('codes', JSON.stringify(codes));
    updateAdminPanel();
}

function resetAll() {
    codes = {};
    users = {};
    coinPrice = 10.00;
    localStorage.clear();
    updateAdminPanel();
    updateUI();
}
