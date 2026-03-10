// Start quiz counter
let flagQuizList;
let currId;

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    setList();
    document.querySelector('#next').addEventListener('click', () => loadNextFlag());
    document.querySelector('#submit').addEventListener('click', () => flagFeedback());
    document.querySelector('#start').addEventListener('click', () => loadNextFlag());
    document.querySelector('#quiz-form').addEventListener('submit', function(event) {
        event.preventDefault();
    });
});


function loadFlagQuiz() {
    // const quizForm = document.querySelector('#quiz-form');
    // quizForm.removeEventListener('submit', flagFeedback);
    // quizForm.addEventListener('submit', loadNextFlag);

    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');
    document.getElementById('next').focus();

    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Flag quiz";
    document.querySelector('#quiz-card').hidden = false;
    reset_score()
}


function loadNextFlag() {
    // const quizForm = document.querySelector('#quiz-form');
    // quizForm.removeEventListener('submit', loadNextFlag);
    // quizForm.addEventListener('submit', flagFeedback);

    // Choose a random flag and load it
    currId = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];

    document.querySelector('#start').hidden = true;
    document.querySelector('#next').hidden = true;
    document.querySelector('#submit').hidden = false;
    document.querySelector('#feedback').hidden = true;
    document.querySelector("#flag").hidden = false;
    document.querySelector("#hint").hidden = false;

    console.log(`list length: ${flagQuizList.length}`, flagQuizList)

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

    const answer = document.querySelector('#answer');
    answer.hidden = false;
    answer.value = "";
    answer.focus();
}


function flagFeedback() {
    // const quizForm = document.querySelector('#quiz-form');
    // quizForm.removeEventListener('submit', flagFeedback);
    // quizForm.addEventListener('submit', loadNextFlag);

    const answer = document.querySelector('#answer').value;
    const scoreboard = document.querySelector('#score');
    const feedback = document.querySelector('#feedback');

    fetch(`get_flag_ans/${currId}`)
    .then(response => response.json())
    .then(country => {
        if (answer.toLowerCase() == country.country.toLowerCase()) {
            fetch(`update_score/${1}`)
            .then(response => response.json())
            .then(data => {
                scoreboard.innerText = "Score: " + data.new_score;
             });
            
            feedback.hidden = false;
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            feedback.innerText = "Correct";
        } else {
            feedback.hidden = false;
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            feedback.innerText = country.country;
        }
    });
    flagQuizList.splice(flagQuizList.indexOf(currId), 1);
    if (flagQuizList.length <= 0) {
        document.querySelector('#page-heading').innerText = "Done"
    }

    document.querySelector('#submit').hidden = true;
    const next = document.querySelector('#next')
    next.hidden = false;
    next.focus();
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