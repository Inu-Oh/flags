// Initiate data TODO  remove this global
let flagCount;
$(document).ready( function() {

    // Add event listeners to switch main quiz GUIs and set quiz list
    $('#flag-quiz').on('click', () => loadFlagCountryQuiz());
    // document.querySelector('#capital-quiz').addEventListener('click', () => loadFlagCapitalQuiz());
    fetch('check_session')
    .then(response => response.json())
    .then(data => {
        switch (data.quiz) {
            case "flag_country":
                loadFlagCountryQuiz();
                break;
            default:
                break;
        }
    })
});


function flagFeedback() {
    // Get result of user quiz answer and set feedback
    const answer = document.querySelector('#answer').value;
    if (answer.length <= 0) return;

    const parser = new DOMParser();
    const cleanAns = parser.parseFromString(answer, 'text/html')
    const ansText = cleanAns.body.innerText;
    const normalizedAns = ansText.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const scoreboard = document.querySelector('#score');
    const feedback = document.querySelector('#feedback');
    const feedbackText = document.querySelector('#feedback-text');

    // Update score and generate feedback
    fetch(`get_flag_ans`)
    .then(response => response.json())
    .then(country => {
        const normalizedCountry = country.country.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        if (normalizedAns.toLowerCase() == normalizedCountry.toLowerCase()) {
            fetch(`update_score/${1}`)
            .then(response => response.json())
            .then(data => {
                scoreboard.innerHTML = "Score: " + data.new_score + " &nbsp;&nbsp ";
                scoreboard.innerHTML += "Flags left: " + flagCount;
             });
            feedback.hidden = false;
            const plus1 = '<span class="text-success float-end pe-3">+1</p>';
            feedbackText.innerHTML = `${country.country} ${plus1}`;
        } else {
            fetch('get_score') 
            .then(response => response.json())           
            .then(data => {
                scoreboard.innerHTML = "Score: " + data.score + " &nbsp;&nbsp ";
                scoreboard.innerHTML += "Flags left: " + flagCount;
             });
            feedback.hidden = false;
            const zero = '<span class="text-danger float-end pe-3">0</span>'
            feedbackText.innerHTML = `${country.country} ${zero}`;
        }
    });
    
    // TODO - game over results page
    if (flagCount <= 0) {
        document.querySelector('#page-heading').innerText = "Done"
    }

    // Set up GUI for feedback and next button
    document.querySelector('#hint-text').innerText = "";
    document.querySelector('#quiz-form').hidden = true;
    const next = document.getElementById('next');
    
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
        if ( data.endQuiz )
            quizResult();
    });
}


function loadFlagCountryQuiz() {
    // Set up quiz question list
    fetch('check_session')
    .then(response => response.json())
    .then(data => {
        if (data.quiz != "flag_country") {
            fetch('set_flag_country_quiz');
        }
    });

    $('#quiz-card').html(`<div class="card mb-3 pt-2 bg-secondary border-light">
            <p id="score" class="pb-3 fs-5 fw-bold text-light"></p>
        </div>

        <div id="flag-div" class="card card-img-top bg-light hover-overlay border-light" 
            data-mbd-ripple-init data-mdb-ripple-color="light">
            <img id="flag" class="card-img-top" src="" alt="">
        </div>
    
        <div id="card-bod" class="container bg-light border-light">
            <div id="hint-frame" class="ps-2 my-1">
                    <p id="hint-text"></p>
            </div>
            <div id="feedback-form-frame">
                <div id="feedback" hidden="true" class="row py-2">
                    <div class="col-10">
                        <p id="feedback-text" class="ps-2 fs-5 fw-bold"></p>
                    </div>
                    <div class="col-2">
                        <a id="next" class="btn btn-success" href="#">Next</a>
                    </div>
                </div>

                <form id="quiz-form" action="" class="row py-2" hidden="true" autocomplete="off">
                    <div class="col-9">
                        <input id="answer" class="form-control" type="text" 
                            name="answer" placeholder="Enter country" value="" autofocus >
                    </div>
                    <div class="col-3">
                        <input id="submit" class="btn btn-success form-control" 
                        type="button" value="Submit">
                    </div>       
                </form>
            </div>
        </div>`);

    document.querySelector('#submit').addEventListener('click', () => flagFeedback());
    document.querySelector('#next').addEventListener('click', () => loadNextFlag());
    
    document.querySelector('#quiz-form').addEventListener('submit', function(event) {
        event.preventDefault();
    });
    const input = document.querySelector('#answer');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.querySelector('#submit').click();
        }
    });
    
    // Switch nav tabs
    document.getElementById('home-link').classList.remove('active');
    document.getElementById('flag-quiz').classList.add('active');

    // Show quiz card
    document.querySelector('#page-heading').innerText = "Name the country !";
    document.querySelector('#quiz-card').hidden = false;

    // Start quiz
    setTimeout(() => {
        updateScoreboard();
        loadNextFlag();
        $('#flag').attr("alt", "Guess the flag");
    }, 100);
}


function loadNextFlag() {    
    // Get flag data
    const hint = document.querySelector('#hint-text');
    const flag = document.querySelector('#flag');
    fetch(`get_flag_q`)
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


function resetScore() {
    // Sets score to 0 in session
    fetch('reset_score')
    .then(response => response.json())
    .then(data => {
        flagCount = data.flagCount;
    });
    const score = document.getElementById('score');
    score.hidden = false;
    score.innerHTML = "Score: 0 &nbsp;&nbsp Flags left: " + flagCount;
}


function quizResult() {
    const score = document.getElementById('score');
    
    fetch('quiz_result')
    .then(response => response.json())
    .then(data => {
        score.innerHTML = `Congrats ! &nbsp; &nbsp; You named ${data.score} countries`;
        quizResultImage(data.result);
    })

    document.getElementById('quiz-form').hidden = true;
    document.getElementById('page-heading').innerText = "That's a wrap !"
}


function quizResultImage(result) {
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    var ctx = canvas.getContext('2d');
    ctx.font = "150px Arial";
    ctx.fillStyle = "green";
    str = result + "%";
    ctx.fillText(str, 190, 230);
    var img = document.createElement("img");
    img.src = canvas.toDataURL();
    document.getElementById('flag').src = img.src;
}


function updateScoreboard() {
    // TODO figure out and fix this
    fetch('update_scoreboard')
    .then(response => response.json())
    .then(data => {
        $('#score').html(data.scoreboardText);
    });   
}