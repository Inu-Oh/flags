// Start quiz counter
let counter = 0;
let flagQuizList = [];


document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
    setList();
});

function loadFlagQuiz() {
    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Test your knowledge of flags"
    const quizForm = document.querySelector('#quiz-form');
    quizForm.hidden = false;

    // Choose a random flag from flag quiz list
    const randomFlag = flagQuizList[Math.floor(Math.random() * flagQuizList.length)];
    console.log(randomFlag);
    
    const quizButton = document.querySelector('#quiz-button');
    quizButton.innerHTML = `<div id="next-q" class="btn btn-primary" value="Start quiz"></div>`;
    quizButton.addEventListener('click', () => loadNextFlag(randomFlag))
}


function loadNextFlag(flagId) {
    const quizForm = document.querySelector('#quiz-form');
    document.querySelector('#country').hidden = false;
    document.querySelector('#quiz-button').value = "Submit";
    const flag = document.querySelector("#flag");
    flag.hidden = false;
    const hint = document.querySelector("#hint");
    hint.hidden = false;

    fetch(`get_question/${flagId}`)
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


function setList() {
    fetch('set_list')
    .then(response => response.json())
    .then(list => {
        console.log(list);
        flagQuizList = list;
    });
}