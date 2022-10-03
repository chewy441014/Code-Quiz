// Timer

// Displays the current time, and if the time is zero or negative stops the timer
function intervalCall() {
    timerEL.textContent = "Time: " + timeLeft + "s";
    timeLeft--;
    if (timeLeft === 0) {
        clearInterval(timeInterval);
    } else if (timeLeft < 0) {
        timeLeft = 0;
        clearInterval(timeInterval);
    }
    if (timeLeft === 0) {
        gameStart = false;
        clearInterval(timeInterval);
        score = timeLeft;
        nameScore();
        viewLeader();
    }
}

// Deducts 15 seconds if the timer is greater than fifteen, otherwise, the timer goes to zero. 
function lostTime() {
    if (timeLeft >= 15) {
        timeLeft -= 15;
    } else {
        timeLeft = 0;
    }
    if (timeLeft === 0) {
        gameStart = false;
        clearInterval(timeInterval);
        score = timeLeft;
        nameScore();
        viewLeader();
    }
}

// Questions

/*
Build a question from two pieces of info: 
1. a list of questions
2. a list of answers 
3. which answer is correct
4. which question number it is
*/

function buildQCardObj(i) {
    // i expects values 1 - 10
    var qCard = {
        question: questionList[i - 1], // string
        answers: answersList.slice(numAns * i - numAns, numAns * i), // array of numAns strings
        correct: correctList[i - 1], // number
        num: questionNum[i - 1] // number
    }
    return qCard;
}

// Delete everything in the card (for loop counts down from length - 1 to 0)
function deleteQCard() {
    for (let i = cardEL.childElementCount - 1; i >= 0; i--) {
        cardEL.children[i].remove();
    }
}

// Clear the current content and populate the current question
function updateQCard(qCard) {
    // Delete everything in the card
    deleteQCard();

    // Sets the question as the title
    var newQuestion = document.createElement("h2");
    newQuestion.innerHTML = qCard.question;
    cardEL.appendChild(newQuestion);

    // For each answer, create a button element
    for (let i = 0; i < numAns; i++) {
        var newButton = document.createElement("button");
        newButton.textContent = qCard.answers[i];
        newButton.addEventListener("click", function () { answeredQCard(qCard, i) });
        cardEL.appendChild(newButton);
    }
}

// Behavior after the user clicks a choice for the question
function answeredQCard(qCard, answer) {
    // answer is the user selected choice (expects 0-3)
    // Compare if the answer is correct, if it is, display 'correct and a new button to go to the next question, if it is not, display 'incorrect and a new button to go to the next question
    // If statement allows questions to only be asked once
    if (!(cardEL.lastChild.getAttribute('id') == "next-ques")) {
        var newMessage = document.createElement("p");
        var newButton = document.createElement("button");
        newButton.setAttribute('id', 'next-ques');
        newButton.addEventListener("click", function () { nextQues(qCard) });
        cardEL.appendChild(newMessage);
        cardEL.appendChild(newButton);
        if (qCard.correct === answer) {
            newMessage.innerHTML = "That's correct!";
        } else {
            newMessage.innerHTML = "Sorry, try again.";
            lostTime();
        }
        if (qCard.num === questionList.length) {
            newButton.innerHTML = "Exit Quiz and View Leaderboard";
            clearInterval(timeInterval);
        } else {
            newButton.innerHTML = "Next Question";
        }
    }
}

// If the last question was answered, end the game, stop the timer, name the score and view the leaderboard, if not then reassign the value of the question object and update the page.
function nextQues(qCard) {
    if (qCard.num < questionList.length) {
        qCard = buildQCardObj(qCard.num + 1)
        updateQCard(qCard);
    } else {
        gameStart = false;
        clearInterval(timeInterval);
        score = timeLeft;
        nameScore();
        viewLeader();
    }
}

// Leader Board

function viewLeader() {
    // Check if the game is in progress, if not, and the number of players is at least one, then 
    if (!gameStart && localStorage.players > 0) {
        // Clear the card
        deleteQCard();
        // Initialize a new array where the data will be stored
        var tableData = [];
        // Access all the high scores and assign them to objects inside the tableData array
        for (let i = 0; i <= localStorage.players; i++) {
            if (!(localStorage.key(i) === "players")) {
                tableData.push({ name: localStorage.key(i), value: localStorage.getItem(localStorage.key(i)) });
            }
        }
        // Sort the data
        tableData.sort(leadCompare);
        // Populate the data, format it and add a button to reset the game. 
        for (let i = 0; i < localStorage.players; i++) {
            var newTable = document.createElement("div");
            newTable.setAttribute('id', 'leader-row');
            newTable.style.display = "flex";
            newTable.style["flex-wrap"] = "nowrap";
            newTable.style["justify-content"] = "space-between";
            newTable.style.border = "solid";
            newTable.style.padding = "10px";
            cardEL.appendChild(newTable);
            var newName = document.createElement("h3");
            newName.innerHTML = tableData[i].name;
            var newScore = document.createElement("h3");
            newScore.innerHTML = tableData[i].value;
            newTable.appendChild(newName);
            newTable.appendChild(newScore);
        }
        var newButton = document.createElement("button");
        newButton.innerHTML = "Back";
        newButton.addEventListener("click", function () { resetGame() });
        cardEL.appendChild(newButton);
        // Display a message telling the user to play some to get high scores into the leaderboard. 
    } else if (!gameStart && localStorage.players === 0) {
        deleteQCard();
        var newMessage = document.createElement("p");
        newMessage.innerHTML = "There are currently no high scores, please play the game to create some! "
        newMessage.style.margin = "25px";
        cardEL.appendChild(newMessage);
        var newButton = document.createElement("button");
        newButton.innerHTML = "Back";
        newButton.addEventListener("click", function () { resetGame() });
        cardEL.appendChild(newButton);
    }
}

// Compare function, shows .sort how to order the values of tableData in descending order
function leadCompare(a, b) {
    return b.value - a.value;
}

// Prompts the user for their name to store their score. 
function nameScore() {
    valid = false;
    var name = "";
    while (!valid || !name) {
        name = prompt("Please enter your name:");
        valid = /^[A-Za-z]*$/.test(name);
        if (!valid || !name) {
            alert("Please enter letters only, required field. ");
        }
    }
    if (score > 0) {
        localStorage.setItem(name.toUpperCase(), score + 1); // corrects for the additional subtraction of the timer
    } else {
        localStorage.setItem(name.toUpperCase(), score);
    }
    localStorage.players++;
}

// Start the game and the timer, assign and build the first question object. 

function startGame() {
    timeInterval = setInterval(intervalCall, 1000);
    gameStart = true;
    var card = buildQCardObj(1);
    updateQCard(card);
}

// Resets the game from the beginning. Used to load the webpage on initial load. 

function resetGame() {
    // Clear any content
    deleteQCard();
    // Check to see if timeLeft already exists, if so, then stop the timer for good measure. 
    if (timeLeft && timeLeft < 75) {
        clearInterval(timeInterval);
    }
    timeLeft = 75;
    timerEL.textContent = "Time: " + timeLeft + "s";
    /*
            <h2 id="big-text">Welcome to the quiz. </h2>
            <p id="start-text">You have 75 seconds to take this ten question quiz. Getting a wrong answer will deduct 15 seconds. Your score is your time after completion. Good luck!</p>
            <button id="start-quiz">Start Quiz</button>
    */
    var newMessage = document.createElement("p");
    var newTitle = document.createElement("h2");
    var newButton = document.createElement("button");
    newMessage.setAttribute('id', "big-text");
    newTitle.setAttribute('id', "start-text");
    newButton.setAttribute('id', "start-quiz");
    newMessage.innerHTML = "You have 75 seconds to take this ten question quiz. Getting a wrong answer will deduct 15 seconds. Your score is your time after completion. The minimum score is zero. Good luck!";
    newTitle.innerHTML = "Welcome to the quiz. ";
    newButton.innerHTML = "Start Quiz";
    newButton.addEventListener("click", function () { startGame() });
    cardEL.appendChild(newTitle);
    cardEL.appendChild(newMessage);
    cardEL.appendChild(newButton);
}

// Initialize global variables and call reset game to generate the starting card. 

const numAns = 4; // Number of answers per question
const questionList = [" Define a javascript array ", " Define a javascript object ", " Define a javascript function ", " Using the DOM, how do you make a new button?  ", 
" Using jQuery, how do you make a new button? ", " Using the DOM and Vanilla JS, how do you make a button functional? ", " Using jQuery, how do you make a button functional? ", 
" Using the DOM and vanilla JS, how do you edit the attributes of an HTML element? ", " Using jQuery, how do you set the text of an HTML element? ", " Why would you write a function? "];
const answersList = [
    "a comma separated list with square brackets", "a group of numbers", "a comma separated list with curly brackets", "an iterable object",
    "a group of methods", "a comma separated list with curly brackets and key value pairs", "the keys and values of a variable", "a generic container with methods",
    "self contained code which executes when called", "a headache", "code which iterates through an array", "code which you can call multiple times",
    "var newButton = document.appendChild('button')", "new Button = document.createElement('button')", "var newButton = document.createElement('button')", "newButton.addEventListener('click', function)",
    "var newButton = document.createElement('button')", "var newButton = $('" + String.fromCharCode(60) + "button" + String.fromCharCode(62) + "') ", "var newButton = $('button')", "var newButton = $('" + String.fromCharCode(60) + "h1" + String.fromCharCode(62) + "')",
    "buttonEl.on('click', function)", "buttonEl.appendChild(function)", "buttonEl.text('Next Question')", "buttonEl.addEventListener('click', function)",
    "buttonEl.addEventListener('click', function)", "buttonEl.click()", "buttonEl.on('click', function)", "buttonEl.on('submit', function)",
    "newElement.setAttribute()", "newElement.innerHTML = 'text-in-here'", "$(newElement).attr('name', 'value')", "newElement.setAttribute('name', 'value')",
    "oldElement.append(newElement)", "newElement.text('text-in-here')", "newElement.innerHTML = 'text-in-here'", "newElement.text = 'text-in-here'",
    "to call code multiple times", "to compartmentalize some concepts and organize", "to keep some variables scoped", "all of the above"
];
const questionNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Question number
const correctList = [0, 1, 0, 2, 1, 3, 2, 3, 1, 3]; // Index of correct answers, expects 0 - numAns

/* DEFAULT VALUES FOR CLARITY
const questionList = [" question 1 ", " question 2 ", " question 3 ", " question 4 ", " question 5 ", " question 6 ", " question 7 ", " question 8 ", " question 9 ", " question 10 "];
const answersList = [
    "answer 1.1", "answer 1.2", "answer 1.3", "answer 1.4",
    "answer 2.1", "answer 2.2", "answer 2.3", "answer 2.4",
    "answer 3.1", "answer 3.2", "answer 3.3", "answer 3.4",
    "answer 4.1", "answer 4.2", "answer 4.3", "answer 4.4",
    "answer 5.1", "answer 5.2", "answer 5.3", "answer 5.4",
    "answer 6.1", "answer 6.2", "answer 6.3", "answer 6.4",
    "answer 7.1", "answer 7.2", "answer 7.3", "answer 7.4",
    "answer 8.1", "answer 8.2", "answer 8.3", "answer 8.4",
    "answer 9.1", "answer 9.2", "answer 9.3", "answer 9.4",
    "answer 10.1", "answer 10.2", "answer 10.3", "answer 10.4"
];
const questionNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const correctList = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
*/

var timeInterval; // initialize global timer var
var timeLeft; // initialize global timeLeft va
var timerEL = document.getElementById('timer'); // initialize global timer object
var cardEL = document.getElementById('card'); // initialize global card object
var gameStart = false; // initialize global status bool
var score = 0; // initialize global score variable
// initialize local storage number of players (AKA number of elements in the leaderboard)
if (!localStorage.players) {
    localStorage.setItem("players", 0);
}

// Event listener for the view leaderboard button
document.getElementById('leaderboard').addEventListener("click", function () { viewLeader() });

// Generate the webpage on load
resetGame();