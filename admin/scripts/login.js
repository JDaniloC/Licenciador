function shakeInput(input) {
    const shakeAnimation = [
        [   { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0px)' }
        ],  { duration: 150, iterations: 2 }
    ]

    input.animate(
        shakeAnimation[0], shakeAnimation[1])
}

function login(form) {
    const emailInput = form.querySelector(
        'input[type=email]');
    const passwordInput = form.querySelector(
        'input[type=password]')
    const email = emailInput.value;
    const password = passwordInput.value;
    
    $.ajax({
        url: BASEURL + '/login', 
        type: 'POST',
        data: JSON.stringify({ email, password }),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            if (data.type === undefined) {
                shakeInput(emailInput);
                shakeInput(passwordInput);
            } else {
                localStorage.setItem(
                    'account', JSON.stringify(data));
                removeLogin()
            }
        }
    })
    return false;
}

function removeLogin() {
    document.querySelector(".overlay").style.display = "none";
    document.querySelector(".login").style.display = "none";

    const licenses = document.querySelector('#licenseNumber');
    const tests = document.querySelector('#testNumber');
    const account = JSON.parse(localStorage.getItem('account'));
    // Aparece apenas os bots

    if (account.type == "admin") {
        licenses.innerText = "∞";
        tests.innerText = "∞";
        $("main").load("views/sellers.html");
    } else {
        licenses.innerText = account.licenses;
        tests.innerText = account.tests;
        $("main").load("views/botlist.html");
    }
}

function closeAccount() {
    localStorage.removeItem('account');
    localStorage.removeItem('bot');
    location.reload();
}