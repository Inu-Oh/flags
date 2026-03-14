// Initiate data
let flagQuizList;
let currId;

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to switch main quiz GUIs and set quiz list
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    document.querySelector('#submit').addEventListener('click', () => flagFeedback());
    document.querySelector('#start').addEventListener('click', () => loadNextFlag());
    setList();
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
    resetScore();

    // Switch nav tabs
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');

    // Show quiz card
    document.querySelector('#page-heading').innerText = "Flag quiz";
    document.querySelector('#quiz-card').hidden = false;
    
    // Start quiz
    loadNextFlag();
}


function loadNextFlag() {
    // Choose a random flag and load it
    currId = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];
    
    // Get flag data
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

    // Set up GUI for quiz question
    document.querySelector('#feedback').hidden = true;
    document.querySelector('#quiz-form').hidden = false;
    const answer = document.querySelector('#answer');
    answer.value = "";
    answer.focus();
}


function flagFeedback() {
    // Get result of user quiz answer and set feedback
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
                scoreboard.innerHTML = "Score: " + data.new_score + " &nbsp;&nbsp ";
                scoreboard.innerHTML += "Flags left: " + flagQuizList.length;
             });
            feedback.hidden = false;
            feedbackText.classList.remove('text-danger');
            feedbackText.classList.add('text-success');
            feedbackText.classList.remove('fs-5');
            feedbackText.classList.add('fs-3');
            feedbackText.innerText = "Correct";
        } else {
            feedback.hidden = false;
            feedbackText.classList.remove('text-success');
            feedbackText.classList.add('text-danger');
            feedbackText.classList.remove('fs-3');
            feedbackText.classList.add('fs-5');
            feedbackText.innerText = country.country;
        }
    });
    flagQuizList.splice(flagQuizList.indexOf(currId), 1);
    if (flagQuizList.length <= 0) {
        document.querySelector('#page-heading').innerText = "Done"
    }

    // Set up GUI for feedback and next button
    document.querySelector('#hint-text').innerText = "";
    document.querySelector('#quiz-form').hidden = true;
    const next = document.getElementById('start');
    next.innerText = "Next";
    setTimeout(() => {
        next.focus();
    }, 100);
}


function getFlagId() {

}


function resetScore() {
    // Sets score to 0 in session
    const score = document.getElementById('score');
    score.hidden = false;
    score.innerHTML = "Score: 0 &nbsp;&nbsp Flags left: " + flagQuizList.length;

    fetch('reset_score');
}


function setList() {
    // Set list of question IDs for quiz progress
    fetch('set_list')
    .then(response => response.json())
    .then(list => {
        flagQuizList = list;
    });
}