// Initiate data TODO  remove this global
$(document).ready( function() {
    // Add event listeners to switch main quiz GUIs or load quiz saved to session
    $('#flag-capital-quiz').on('click', () => loadFlagCapitalQuiz());
    $('#flag-country-quiz').on('click', () => loadFlagCountryQuiz());
    // Switch automatically if a quiz is storred in session
    fetch('check_session')
    .then(response => response.json())
    .then(data => {
        switch (data.quiz) {
            case "flag_capital":
                loadFlagCapitalQuiz();
                break;
            case "flag_country":
                loadFlagCountryQuiz();
                break;
            default:
                break;
        }
    })
});


function flagCapitalFeedback() {
    // Get result of user quiz answer and set feedback
    const $answer = $('#answer').val();
    if ($answer.length <= 0) return;

    const parser = new DOMParser();
    const cleanAns = parser.parseFromString($answer, 'text/html')
    const ansText = cleanAns.body.innerText;
    const normalizedAns = ansText.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    $('#feedback').attr("hidden", false);

    // Update score and generate feedback
    fetch(`get_flag_capital_ans`)
    .then(response => response.json())
    .then(ans => {
        const normalizedCapital = ans.capital.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        if (normalizedAns.toLowerCase() == normalizedCapital.toLowerCase()) {
            fetch(`update_score`)
            .then(response => response.json())
            .then(data => {
                $('#score').html(data.scoreboardText);
             });
            const plus1 = '<span class="text-success float-end pe-3">+1</p>';
            $('#feedback-text').html(`${ans.capital} ${plus1}`);
        } else {
            fetch('get_score') 
            .then(response => response.json())           
            .then(data => {
                $('#score').html(data.scoreboardText);
             });
            const zero = '<span class="text-danger float-end pe-3">0</span>'
            $('#feedback-text').html(`${ans.capital} ${zero}`);
        }
    });

    // Set up GUI for feedback and next button
    $('#hint-text').text("");
    $('#quiz-form').attr("hidden", true);
    
    setTimeout(() => {
        $('#next').focus();
        getFlagId();
    }, 100);
}


function flagCountryFeedback() {
    // Get result of user quiz answer and set feedback
    const $answer = $('#answer').val();
    if ($answer.length <= 0) return;

    const parser = new DOMParser();
    const cleanAns = parser.parseFromString($answer, 'text/html')
    const ansText = cleanAns.body.innerText;
    const normalizedAns = ansText.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    $('#feedback').attr("hidden", false);

    // Update score and generate feedback
    fetch(`get_flag_country_ans`)
    .then(response => response.json())
    .then(ans => {
        const normalizedCountry = ans.country.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        if (normalizedAns.toLowerCase() == normalizedCountry.toLowerCase()) {
            fetch(`update_score`)
            .then(response => response.json())
            .then(data => {
                $('#score').html(data.scoreboardText);
             });
            const plus1 = '<span class="text-success float-end pe-3">+1</p>';
            $('#feedback-text').html(`${ans.country} ${plus1}`);
        } else {
            fetch('get_score') 
            .then(response => response.json())           
            .then(data => {
                $('#score').html(data.scoreboardText);
             });
            const zero = '<span class="text-danger float-end pe-3">0</span>'
            $('#feedback-text').html(`${ans.country} ${zero}`);
        }
    });

    // Set up GUI for feedback and next button
    $('#hint-text').text("");
    $('#quiz-form').attr("hidden", true);
    
    setTimeout(() => {
        $('#next').focus();
        getFlagId();
    }, 100);
}


function getFlagId() {
    // Get ID of next flag question and update quiz question list in session
    fetch('get_flag_id')
    .then(response => response.json())
    .then(data => {
        if ( data.endQuiz )
            quizResult();
    });
}


function loadFlagCard() {
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

    // Set events listeners
    $('#next').on('click', () => loadNextFlag());
    $('#quiz-form').on('submit', function(event) {
        event.preventDefault();
    });
    $('#answer').on('keypress', function(event) {
        if (event.key === 'Enter') {
            $('#submit').click();
        }
    });
}


function loadFlagCapitalQuiz() {
    // Set up quiz question list
    fetch('check_session')
    .then(response => response.json())
    .then(data => {
        if (data.quiz != "flag_capital") {
            fetch('set_flag_capital_quiz');
        }
    });

    // Add quiz card, flag, form and feedback GUI with event listeners
    loadFlagCard();
    $('#answer').attr("placeholder", "Enter capital")
    $('#submit').on('click', () => flagCapitalFeedback());
    
    // Switch nav tabs
    $('#home-link').removeClass('active');
    $('#flag-country-quiz').removeClass('active');
    $('#flag-capital-quiz').addClass('active');

    // Start quiz
    setTimeout(() => {
        updateScoreboard();
        loadNextFlag();

        // Show quiz card content
        $('#page-heading').text("Name the capital !");
        $('#quiz-card').attr("hidden", false);
        $('#flag').attr("alt", "Guess the flag's capital");
    }, 100);
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

    // Add quiz card, flag, form and feedback GUI and event listens
    loadFlagCard();
    $('#submit').on('click', () => flagCountryFeedback());
    
    // Switch nav tabs
    $('#home-link').removeClass('active');
    $('#flag-country-quiz').addClass('active');
    $('#flag-capital-quiz').removeClass('active');

    // Start quiz
    setTimeout(() => {
        updateScoreboard();
        loadNextFlag();

        // Show quiz card content
        $('#page-heading').text("Name the country !");
        $('#quiz-card').attr("hidden", false);
        $('#flag').attr("alt", "Guess the flag's country");
    }, 100);
}


function loadNextFlag() {    
    // Get flag and hint data
    const $hint = $('#hint-text');
    fetch(`get_flag_q`)
    .then(response => response.json())
    .then(data => {
        $('#flag').attr("src", data.flag);
        if (data.hint != "") {
            $hint.text(data.hint);
        } else {
            $hint.text("");
        }
    });

    // Set up GUI for quiz question
    $('#feedback').attr("hidden", true);
    $('#quiz-form').attr("hidden", false);
    const $answer = $('#answer');
    $answer.val("");
    $answer.focus();
}


function resetScore() {
    // Reset the quiz, set flag data and load next question
    fetch('set_flag_country_quiz');
    setTimeout(() => {
        updateScoreboard();
        loadNextFlag();
    }, 100)
}


function quizResult() {
    // Get and show user quiz results
    fetch('quiz_result')
    .then(response => response.json())
    .then(data => {
        $('#score').html(`Congrats ! &nbsp; &nbsp; You named ${data.score} countries`);
        quizResultImage(data.result);
    })
    $('#quiz-form').attr("hidden", true);
    $('page-heading').text("That's a wrap !");
}


function quizResultImage(result) {
    // Generate and display image with results - JS got clearer image than jQuery here
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
    $('#flag').attr("src", img.src);
}


function updateScoreboard() {
    fetch('update_scoreboard')
    .then(response => response.json())
    .then(data => {
        $('#score').html(data.scoreboardText);
    });   
}