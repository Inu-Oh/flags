// Start quiz counter
counter = 0

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to switch between different quiz views and home page
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz()); // TODO - create index page with nodes that will be needed for the quiz
});

function loadFlagQuiz() {
    // Quiz form will be set up here
    const quizForm = document.querySelector('#quiz-form');
    quizForm.hidden = false;
    quizForm.innerText = "It's a start";
}