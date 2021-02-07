function loadBotlist() {
    $.ajax({
        url: BASEURL + '/bots',
        method: 'GET',
        success: function(response) {
            Object.keys(response).forEach(botname => {
                response[botname].name = botname;
                addBot(response[botname]);
            });
        }
    });
}

function selectBot(bot) {
    localStorage.setItem("bot", bot.id)
    localStorage.setItem("botname", bot.title)
    let button = document.querySelector(
        "header button"
    )
    button.style.opacity = 100;
    button.disabled = false;
    $("main").load("views/clients.html");
}

function addBot(bot) {
    const account = JSON.parse(
        localStorage.getItem("account"));
    const button = document.createElement('button');
    if (account["botlist"].indexOf(
        bot.name) === -1) {
        button.disabled = true;
        if (!account.show) {
            button.style.display = "none";
        }
    }
    button.id = bot.name;
    button.setAttribute("title", bot.title)
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