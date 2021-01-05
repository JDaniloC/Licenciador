const sellers = {};

function searchSeller(email, data) {
    if (sellers.hasOwnProperty(email)) {
        sellers[email].licenses = data.licenses;
        sellers[email].botlist = data.botlist;
    } else {
        sellers[email] = { 
            licenses: data.licenses, 
            botlist: data.botlist 
        };
        addSeller(email);
    }
}
function loadSellersPage() {
    $.ajax({
        url: "http://localhost:8000" + '/sellers',
        method: 'GET',
        success: function(response) {
            Object.keys(response).forEach(email => {
                if (response[email].type === "seller") {
                    searchSeller(email, response[email]);
                }
            });
        }
    });
    $.ajax({
        url: "http://localhost:8000" + '/bots',
        method: 'GET',
        success: function(response) {
            Object.keys(response).forEach(botname => {
                response[botname].name = botname;
                addBot(response[botname]);
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
    const email = emailInput.value;
    const licenses = licensesInput.value;

    const botlist = [];
    document.querySelectorAll(
        "input[type=checkbox]:checked"
    ).forEach(input => {
        botlist.push(input.id);
        input.checked = false;
    });
    $.ajax({
        url: "http://localhost:8000" + '/sellers',
        type: 'POST',
        data: JSON.stringify({ email, licenses, botlist }),
        success: function(data) {searchSeller(email, data)}
    })
    emailInput.value = "";
    licensesInput.value = "";
    return false;
}

function selectSeller(select) {
    document.querySelector(
        "input#selleremail"
    ).value = select.value;
    document.querySelector(
        "input#licensedays"
    ).value = sellers[select.value].licenses;
    selectBots(sellers[select.value].botlist);
}
function selectBots(list) {
    document.querySelectorAll(
        "input[type=checkbox]"
    ).forEach(input => {
        input.checked = false;
    })
    list.forEach(bot => {
        document.querySelector(`input#${bot}`).checked = true;
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
            <img src="${bot.image}">
        </div>
    </span>`
    document.querySelector(".bot-selection").appendChild(label);
}
loadSellersPage()