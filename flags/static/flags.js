// Start quiz counter
let flagQuizList;
let currId;

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    setList();
    document.querySelector('#submit').addEventListener('click', () => flagFeedback());
    document.querySelector('#start').addEventListener('click', () => loadNextFlag());
    document.querySelector('#quiz-form').addEventListener('submit', function(event) {
        event.preventDefault();
    });
    const input = document.querySelector('#answer');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.querySelector('#submit').click();
        }
    });
});


function loadFlagQuiz() {
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');

    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Flag quiz";
    document.querySelector('#quiz-card').hidden = false;
    document.querySelector('#feedback').hidden = false;
    reset_score()

    document.getElementById('start').focus();
}


function loadNextFlag() {
    // Choose a random flag and load it
    currId = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];
    console.log(`list length: ${flagQuizList.length}`, flagQuizList)
    const hint = document.querySelector('#hint-text');

    fetch(`get_flag_q/${currId}`)
    .then(response => response.json())
    .then(country => {
        flag.src = country.flag;
        if (country.hint != "") {
            hint.innerText = country.hint;
        } else {
            hint.innerText = "";
        }
    });

    document.querySelector('#feedback').hidden = true;
    document.querySelector('#quiz-form').hidden = false;
    const answer = document.querySelector('#answer');
    answer.disabled = false;
    answer.value = "";
    answer.focus();
}


function flagFeedback() {
    const answer = document.querySelector('#answer');
    const scoreboard = document.querySelector('#score');
    const feedback = document.querySelector('#feedback');
    const feedbackText = document.querySelector('#feedback-text');

    fetch(`get_flag_ans/${currId}`)
    .then(response => response.json())
    .then(country => {
        if (answer.value.toLowerCase() == country.country.toLowerCase()) {
            fetch(`update_score/${1}`)
            .then(response => response.json())
            .then(data => {
                scoreboard.innerText = "Score: " + data.new_score;
             });
            feedback.hidden = false;
            feedbackText.classList.remove('text-danger');
            feedbackText.classList.add('text-success');
            feedbackText.innerText = "Correct";
        } else {
            feedback.hidden = false;
            feedbackText.classList.remove('text-success');
            feedbackText.classList.add('text-danger');
            feedbackText.innerText = country.country;
        }
    });
    flagQuizList.splice(flagQuizList.indexOf(currId), 1);
    if (flagQuizList.length <= 0) {
        document.querySelector('#page-heading').innerText = "Done"
    }

    document.querySelector('#hint-text').innerText = "";
    document.querySelector('#quiz-form').hidden = true;
    answer.disabled = true;
    const next = document.getElementById('start');
    next.innerText = "Next";
    setTimeout(() => {
        next.focus();
    }, 500);
}


function reset_score() {
    const score = document.getElementById('score');
    score.hidden = false;
    score.innerText = "Score: 0";

    fetch('reset_score');
}


function setList() {
    fetch('set_list')
    .then(response => response.json())
    .then(list => {
        flagQuizList = list;
    });
}