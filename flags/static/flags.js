// Initiate data
let flagCount;
let currId;

document.addEventListener('DOMContentLoaded', function() {
    // Create a list for first quiz
    setList();
    // Add event listeners to switch main quiz GUIs and set quiz list
    document.querySelector('#flag-quiz').addEventListener('click', () => loadFlagQuiz());
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
    // Choose a random flag and set currID
    resetScore();
    getFlagId();

    // Switch nav tabs
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');

    // Show quiz card
    document.querySelector('#page-heading').innerText = "Flag quiz";
    document.querySelector('#quiz-card').hidden = false;
    
    
    // Start quiz
    setTimeout(() => {
        loadNextFlag();
    }, 100);
}


function loadNextFlag() {    
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
    const answer = document.querySelector('#answer').value;
    const parser = new DOMParser();
    const cleanAns = parser.parseFromString(answer, 'text/html')
    const ansText = cleanAns.body.innerText;
    const normalizedAns = ansText.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const scoreboard = document.querySelector('#score');
    const feedback = document.querySelector('#feedback');
    const feedbackText = document.querySelector('#feedback-text');

    // Update score and generate feedback
    fetch(`get_flag_ans/${currId}`)
    .then(response => response.json())
    .then(country => {
        const normalizedCountry = country.country.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        // TODO - remove log after testing
        console.log('Ans:', ansText, normalizedAns, 'Corr:', country.country, normalizedCountry);
        if (normalizedAns.toLowerCase() == normalizedCountry.toLowerCase()) {
            fetch(`update_score/${1}`)
            .then(response => response.json())
            .then(data => {
                scoreboard.innerHTML = "Score: " + data.new_score + " &nbsp;&nbsp ";
                scoreboard.innerHTML += "Flags left: " + flagCount;
             });
            feedback.hidden = false;
            feedbackText.classList.remove('text-danger');
            feedbackText.classList.add('text-success');
            feedbackText.classList.remove('fs-5');
            feedbackText.classList.add('fs-3');
            feedbackText.innerText = "Correct";
        } else {
            fetch('get_score') 
            .then(response => response.json())           
            .then(data => {
                scoreboard.innerHTML = "Score: " + data.score + " &nbsp;&nbsp ";
                scoreboard.innerHTML += "Flags left: " + flagCount;
             });
            feedback.hidden = false;
            feedbackText.classList.remove('text-success');
            feedbackText.classList.add('text-danger');
            feedbackText.classList.remove('fs-3');
            feedbackText.classList.add('fs-5');
            feedbackText.innerText = country.country;
        }
    });
    
    // TODO - game over results page
    if (flagCount <= 0) {
        document.querySelector('#page-heading').innerText = "Done"
    }

    // Set up GUI for feedback and next button
    document.querySelector('#hint-text').innerText = "";
    document.querySelector('#quiz-form').hidden = true;
    const next = document.getElementById('start');
    
    next.innerText = "Next";
    setTimeout(() => {
        next.focus();
        getFlagId();
    }, 100);
}


function getFlagId() {
    // Get ID of next flag question and update quiz question list in session
    fetch('get_flag_id')
    .then(response => response.json())
    .then(data => {
        flagCount = data.flagCount;
        currId = data.currId;
    });
}


function resetScore() {
    // Sets score to 0 in session
    const score = document.getElementById('score');
    score.hidden = false;
    score.innerHTML = "Score: 0 &nbsp;&nbsp Flags left: " + flagCount;

    fetch('reset_score');
}


function setList() {
    // Set list of question IDs in session for quiz progress & get question count
    fetch('set_list')
    .then(response => response.json())
    .then(data => {
        flagCount = data.flagCount;
    });
}