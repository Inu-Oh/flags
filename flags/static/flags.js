// Start quiz counter
let counter = 0;
let tested = [];


document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
});

function loadFlagQuiz() {
    // Quiz form will be set up here
    document.querySelector('#page-heading').innerText = "Test your knowledge of flags"
    const quizForm = document.querySelector('#quiz-form');
    quizForm.hidden = false;
    
    const quizButton = document.querySelector('#quiz-button');
    quizButton.innerHTML = `<div id="next-q" class="btn btn-primary" value="Start quiz"></div>`;
    quizButton.addEventListener('click', () => loadNextFlag())
}


function loadNextFlag() {
    const quizForm = document.querySelector('#quiz-form');
    document.querySelector('#country').hidden = false;
    document.querySelector('#quiz-button').value = "Submit";
    const flag = document.querySelector("#flag");
    flag.hidden = false;
    const hint = document.querySelector("#hint");
    hint.hidden = false;

    fetch('get_question')
    .then(response => response.json())
    .then(country => {

        quizForm.value = country.pk
        flag.src = country.flag;
        if (country.hint != "") {
            hint.innerText = country.hint;
        } else {
            hint.innerText = "";
        }
    });
}