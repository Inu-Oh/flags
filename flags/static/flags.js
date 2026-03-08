// Start quiz counter
let flagQuizList;
let currId;
console.log(flagQuizList);

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    setList();
    document.querySelector('#next').addEventListener('click', () => loadNextFlag())
    document.querySelector('#submit').addEventListener('click', () => flagFeedback());
    document.querySelector('#start').addEventListener('click', () => loadNextFlag());
});


function loadFlagQuiz() {
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');
    reset_score()

    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Flag quiz"
    const quizForm = document.querySelector('#quiz-form');
    quizForm.hidden = false;
    console.log("quiz loaded")
}


function loadNextFlag() {
    // Choose a random flag and load it
    currId = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];

    document.querySelector('#start').hidden = true;
    document.querySelector('#next').hidden = true;
    document.querySelector('#submit').hidden = false;
    document.querySelector('#feedback').hidden = true;
    console.log("quiz started / next question")

    console.log(`list length: ${flagQuizList.length}`, flagQuizList)
    const answer = document.querySelector('#answer');
    answer.hidden = false;
    answer.value - "";
    
    const flag = document.querySelector("#flag");
    flag.hidden = false;
    const hint = document.querySelector("#hint");
    hint.hidden = false;

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
}


function flagFeedback() {
    document.querySelector('#next').hidden = false;
    document.querySelector('#submit').hidden = true;

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