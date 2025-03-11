const { set } = require("express/lib/application");

let countdown = document.getElementById('countdown');
let button = document.getElementById('start');
let seconds = document.getElementById('seconds');

let timeleft = seconds.value;

button.addEventListener('click', function() {
    setInterval(function() {
        countdown.innerHTML = seconds.value;
        if (timeleft >= 0) {
            countdown.innerText = timeleft;
            timeleft -= 1;
        } else {
            setTimeout(function() {
                countdown.innerHTML = "Time's up!";
            }
            , seconds.value * 1000);
            clearInterval(this);
        }
    }, 1000);
});
