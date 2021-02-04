function loadClientsPage() {
    const account = JSON.parse(localStorage.getItem('account'));
    const bot = localStorage.getItem('bot')
    $.ajax({
        url: BASEURL + '/clients',
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

function saveClients() {
    const account = JSON.parse(
        localStorage.getItem('account'));
    const email = document.querySelector(
        "#newclient");
    $.ajax({
        url: BASEURL + '/clients',
        type: 'POST',
        data: JSON.stringify({ 
            seller: account.email, 
            client: email.value,
            bot: localStorage.getItem('bot')
        }),
        success: function(response) {
            clients[email.value] = response;
            addClient(email.value);
            email.value = '';
        }
    });
    return false;
}

function deleteUser() {
    const email = document.querySelector(
        "input#emailpreview").value;
    if (!email) {
        return false;
    }
    $.ajax({
        url: BASEURL + '/clients',
        type: 'DELETE',
        data: JSON.stringify({ email }),
        success: function() {
            location.reload()
        }
    })
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

function giveLicense(free = false) {
    const client = document.querySelector(
        "#emailpreview").value;
    if (!client) {
        return false;
    }

    const account = JSON.parse(
        localStorage.getItem('account')); 
    const bot = localStorage.getItem('bot')
    $.ajax({
        url: BASEURL + '/licenses',
        type: 'POST',
        data: JSON.stringify({ 
            seller: account.email, 
            client, free, bot
        }),
        success: function(response) {
            let account = JSON.parse(localStorage.getItem('account'))
            account['licenses'] = response.licenses
            account['tests'] = response.tests
            clients[client].licenses[bot] = response.time;
            document.querySelector(
                "#licensedayspreview"
            ).value = response.time;
            localStorage.setItem("account", JSON.stringify(account))
            if (free) {
                document.querySelector(
                    "p#testNumber"
                ).textContent = response.tests
            } else {
                document.querySelector(
                    "p#licenseNumber"
                ).textContent = response.licenses
            }
        }
    });
    return false;
}

loadClientsPage();