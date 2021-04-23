function searchSeller(email, data) {
    if (sellers.hasOwnProperty(email)) {
        sellers[email].licenses = data.licenses;
        sellers[email].botlist = data.botlist;
        sellers[email].show = data.show;
    } else {
        sellers[email] = { 
            licenses: data.licenses, 
            botlist: data.botlist,
            show: data.show 
        };
        addSeller(email);
    }
}
function loadSellersPage() {
    let account = JSON.parse(localStorage.getItem('account'));
    $.ajax({
        url: BASEURL + '/sellers',
        method: 'GET',
        data: { email: account.email },
        success: function(response) {
            Object.keys(response).forEach(index => {
                if (response[index].type === "seller") {
                    searchSeller(response[index].email, response[index]);
                }
            });
        }
    });
    $.ajax({
        url: BASEURL + '/bots',
        method: 'GET',
        success: function(response) {
            Object.keys(response).forEach(index => {
                addBot(response[index]);
            });
        }
    });
}
function saveSeller(event) {
    event.preventDefault();
    const emailInput = document.querySelector(
        "input#selleremail")
    const licensesInput = document.querySelector(
        "input#licensedays")
    const showInput = document.querySelector(
        "input#show")
    const admin = JSON.parse(localStorage.getItem('account')).email;
    const email = emailInput.value;
    const licenses = licensesInput.value;
    const show = showInput.checked;
    const botlist = [];

    document.querySelectorAll(
        ".bot-selection input[type=checkbox]:checked"
    ).forEach(input => {
        botlist.push(input.id);
        input.checked = false;
    });
    $.ajax({
        url: BASEURL + '/sellers',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ 
            email, admin, licenses, botlist, show 
        }),
        success: function(data) {
            searchSeller(email, data)
        }
    })
    emailInput.value = "";
    licensesInput.value = "";
    showInput.value = false;
    return false;
}

function deleteSeller(event) {
    event.preventDefault();
    const admin = JSON.parse(localStorage.getItem('account')).email;
    const email = document.querySelector(
        "input#selleremail").value;
    if (!email) {
        return false;
    }
    $.ajax({
        url: BASEURL + '/sellers',
        type: 'DELETE',
        data: JSON.stringify({ email, creatorEmail: admin }),
        contentType: "application/json; charset=utf-8",
        success: function() {
            location.reload()
        }
    })
    return false;
}

function selectSeller(select) {
    let email, licenses, bots, checked;
    if (!select.value) {
        bots = [];
        email = "";
        licenses = "";
        checked = false;
    } else {
        email = select.value
        bots = sellers[select.value].botlist
        checked = sellers[select.value].show
        licenses = sellers[select.value].licenses
    }
    document.querySelector(
        "input#selleremail"
    ).value = email;
    document.querySelector(
        "input#licensedays"
    ).value = licenses;
    document.querySelector(
        "#show"
    ).checked = checked;
    selectBots(bots);
}
function selectBots(list) {
    document.querySelectorAll(
        "input[type=checkbox]"
    ).forEach(input => {
        input.checked = false;
    })
    list.forEach(botName => {
        const input = document.querySelector(`input#${botName}`)
        if (input) {
            input.checked = true;
        }
    });
}

function addSeller(email) {
    const option = document.createElement('option');
    option.value = email;
    option.innerText = email;
    document.querySelector(
        "select#clientdropdown"
    ).appendChild(option)
}
function addBot(bot) {
    const label = document.createElement('label');
    label.setAttribute('for', bot.name)
    label.innerHTML = `
    <input type="checkbox" id="${bot.name}">
    <span>
        <h3> ${bot.title} </h3>
        <div>
            <img src="${bot.imageURL}">
        </div>
    </span>`
    document.querySelector(".bot-selection").appendChild(label);
}
loadSellersPage()