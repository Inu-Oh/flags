// Start quiz counter
counter = 0

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
});

function loadFlagQuiz() {
    // Quiz form will be set up here
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

    fetch('/get_question/')
    .then(response => response.json())
    .then(data => {
        quizForm.innerHTML = `<div><img src="${data['country']}">Image</div>`;
        if (data['hint'] != "") {
            quizForm.innerHTML += `<div>${data['hint']}</div>`;
        }    
    });
}