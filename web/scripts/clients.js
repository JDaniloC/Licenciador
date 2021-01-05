const clients = {};

function loadClientsPage() {
    const account = JSON.parse(localStorage.getItem('account'));
    const bot = localStorage.getItem('bot')
    $.ajax({
        url: "http://localhost:8000" + '/clients',
        method: 'GET',
        data: { email: account.email, bot },
        success: function(response) {
            Object.keys(response).forEach(email => {
                clients[email] = response[email];
                addClient(email);
            });
        }
    });
}

function saveClients(form) {
    const account = JSON.parse(
        localStorage.getItem('account'));
    const email = form.querySelector("input[type=email]");
    $.ajax({
        url: "http://localhost:8000" + '/clients',
        method: 'POST',
        data: { 
            seller: account.email, 
            client: email 
        },
        success: function(response) {
            clients[email] = response;
            addClient(email);
        }
    });
    return false;
}

function addClient(email) {
    const option = document.createElement('option');
    option.value = email;
    option.innerText = email;
    document.querySelector(
        "select#clientdropdown"
    ).appendChild(option);
}

function selectClient(dropdown) {
    const bot = localStorage.getItem('bot');
    const value = dropdown.value;
    const email = document.querySelector("#emailpreview")
    const licenses = document.querySelector("#licensedayspreview")
    if (value !== "") {
        const days = clients[value].licenses[bot];
        email.value = value;
        licenses.value = days;
    } else {
        email.value = "";
        licenses.value = "";
    }
}

loadClientsPage();