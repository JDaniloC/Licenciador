function loadBotlist() {
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

function selectBot(button) {
    localStorage.setItem("bot", button.id)
    document.querySelector(
        "header button"
    ).style.opacity = 100;
    $("main").load("views/clients.html");
}

function addBot(bot) {
    const account = JSON.parse(
        localStorage.getItem("account"));
    const button = document.createElement('button');
    if (account["botlist"].indexOf(
        bot.name) === -1) {
        button.disabled = true;
    }
    button.id = bot.name;
    button.addEventListener('click', () => selectBot(button));
    button.innerHTML = `
    <h2> ${bot.title} </h2>
    <div>
        <img src="${bot.image}">
    </div>
    `;
    document.querySelector(".bot-list").appendChild(button);
}
loadBotlist();