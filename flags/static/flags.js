// Start quiz counter
let flagQuizList;


document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    setList();
});


function loadFlagQuiz() {
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');
    const score = document.getElementById('score');
    score.hidden = false;
    score.innerText = "Score: 0";

    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Flag quiz"
    const quizForm = document.querySelector('#quiz-form');
    quizForm.hidden = false;

    // Choose a random flag from flag quiz list
    const randomFlag = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];
    
    const quizButton = document.querySelector('#quiz-button');
    quizButton.innerHTML = `<div id="next-q" class="btn btn-primary" value="Start quiz"></div>`;
    quizButton.addEventListener('click', () => loadNextFlag(randomFlag))
}


function loadNextFlag(flagId) {
    document.querySelector('#answer').hidden = false;
    const quizButton = document.querySelector('#quiz-button')
    
    const flag = document.querySelector("#flag");
    flag.hidden = false;
    const hint = document.querySelector("#hint");
    hint.hidden = false;

    fetch(`get_flag_q/${flagId}`)
    .then(response => response.json())
    .then(country => {
        flag.src = country.flag;
        if (country.hint != "") {
            hint.innerText = country.hint;
        } else {
            hint.innerText = "";
        }
    });

    quizButton.value = "Submit";
    quizButton.addEventListener('click', () => flagFeedback(flagId));
}


function flagFeedback(flagId) {
    const answer = document.querySelector('#answer').value;
    const quizButton = document.querySelector('#quiz-button');

    fetch(`get_flag_ans/${flagId}`)
    .then(response => response.json())
    .then(country => {
        if (answer.toLowerCase() == country.country.toLowerCase()) {
            updateScore(1);
        } else {
            updateScore(0);
        }
    });
    

    flagQuizList.splice(flagQuizList.indexOf(flagId), 1);
    if (flagQuizList.length > 0) {
        const nextFlag = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];
        quizButton.value = "Next";
        quizButton.addEventListener('click', () => loadNextFlag(nextFlag));
    } else {
        // TODO - add score info to page
        document.querySelector('#page-heading').innerText = "Done"
    }
}


function updateScore(score) {
    const scoreboard = document.querySelector('#score');

    fetch(`update_score/${score}`)
    .then(response => response.json())
    .then(data => {
        scoreboard.innerText = data.new_score;
    });
}


function setList() {
    fetch('set_list')
    .then(response => response.json())
    .then(list => {
        flagQuizList = list;
    });
}