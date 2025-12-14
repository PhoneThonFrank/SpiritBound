import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    where,
    getDocs,
    query,
    collection,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGQkIeOEygkt2TzHz9WIkV2Y8zT6hy0lc",
    authDomain: "spirit-bound.firebaseapp.com",
    projectId: "spirit-bound",
    storageBucket: "spirit-bound.firebasestorage.app",
    messagingSenderId: "403783020938",
    appId: "1:403783020938:web:7d5f2d1f86fb2f7d12d873"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);




// DOM elements
const introModal = new bootstrap.Modal(document.getElementById("introModal"));
const introModalContent = document.getElementById("introModalContent");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownElement = document.getElementById("countdown-text");

const questionIdElement = document.getElementById("question-counter");
const questionElement = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const currentPointsContainer = document.getElementById("points");
const correctModal = new bootstrap.Modal(document.getElementById("correctModal"));
const incorrectModal = new bootstrap.Modal(document.getElementById("incorrectModal"));
const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
const resultModal = new bootstrap.Modal(document.getElementById("resultModal"));
const resultCon = document.getElementById("resultsCon");
const alertModal = new bootstrap.Modal(document.getElementById("alertModal"));
const nextButton = document.getElementById("next-btn");
const addPointsElement = document.getElementById("addPoints");
const incorrectReducePoint = document.getElementById("removePoints");
const timerDisplay = document.getElementById("timer");

const doublePointsBtn = document.getElementById("doublePointsBtn");
const addTimeBtn = document.getElementById("addTimeBtn");
const highStakesBtn = document.getElementById("highStakesBtn");
const powerUpAlertBox = document.getElementById("powerUpAlertBox");

// Sound Effects
const startSoundElement = document.getElementById("startSound");
const correctSoundElement = document.getElementById("correctSound");
const incorrectSoundElement = document.getElementById("incorrectSound");
const finishSoundElement = document.getElementById("finishSound");
const addTimeSoundElement = document.getElementById("addTimeSound");
const powerUpSoundElement = document.getElementById("powerupSound");
const timerSoundElement = document.getElementById("timerSound");
const warningSoundElement = document.getElementById("warningSound");
const alarmSoundElement = document.getElementById("alarmSound");
const bgmSoundElement = document.getElementById("bgmSound");
const countdownSoundElement = document.getElementById("countdownSound");

// State
nextButton.disabled = true;
let doublePointStatus = false;
let doublePointUse = false;
let addTimeUse = false;
let highStakesStatus = false;
let highStakesUse = false;
let powerActiveCurrent = false;

let totalPoints = 0;
let correctQuestion = 0;
let addPoints = 0;
let timeLeft = 60;
let currentQuestion = 1;
let questions = [];
let quizTimer = null;


function parseChapterAndCourseId() {
    const fragmentWithHash = window.location.hash || "";
    const fragment = fragmentWithHash.startsWith("#")
        ? fragmentWithHash.slice(1)
        : fragmentWithHash;

    const cendIndex = fragment.indexOf("cend");
    if (cendIndex === -1) {
        return { chapterKey: "", courseId: "" };
    }

    const chapterKey = fragment.slice(0, cendIndex);
    const courseId = fragment.slice(cendIndex + 4);
    return { chapterKey, courseId };
}

let userEmail;
let userHasDoneThisQuiz = false;
let currentUserChapData;
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmail = user.email;
        // console.log(userEmail);
        getUserData();
    } else {
        window.location.href = "../mycourses.html";
    }
});

async function getUserData() {
    const { chapterKey, courseId } = parseChapterAndCourseId();
    // console.log(userEmail);

    const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);
    currentUserChapData = userSnapshot.docs[0].data();
    // console.log(currentUserChapData);

    for (let i = 0; i < currentUserChapData.courses.length; i++) {
        // console.log(currentUserChapData.courses[i].chapterData[chapterKey].quizDone);

        if (courseId === currentUserChapData.courses[i].id) {

            userHasDoneThisQuiz = currentUserChapData.courses[i].chapterData[chapterKey].quizDone;
            // console.log(userHasDoneThisQuiz);

        }
    }

}

async function loadQuestionsFromFirestore() {
    const { chapterKey, courseId } = parseChapterAndCourseId();


    if (!chapterKey || !courseId) {
        showAlertModal("Invalid or missing course/chapter identifier.");
        return [];
    }

    try {
        const courseFSdocRef = doc(db, "course-data", courseId);
        const courseData = await getDoc(courseFSdocRef);
        document.getElementById('quizDisplayTitle').innerText = courseData.data().chapterData[chapterKey].title;
        if (!courseData.exists()) {
            showAlertModal("Course not found.");
            return [];
        }

        const data = courseData.data();

        if (
            !data.chapterData ||
            !data.chapterData[chapterKey] ||
            !Array.isArray(data.chapterData[chapterKey].questions)
        ) {
            showAlertModal("No questions found for this chapter.");
            return [];
        }

        return data.chapterData[chapterKey].questions;
    } catch (err) {
        console.error("Failed to load course data:", err);
        showAlertModal("Error loading course data.");
        return [];
    }
}

// Countdown screen
function showCountdown() {
    countdownOverlay.style.display = "flex";

    const animateZoom = () => {
        countdownElement.classList.remove("zoom");
        void countdownElement.offsetWidth;
        countdownElement.classList.add("zoom");
    };
    const playCountdownTick = () => {
        if (countdownSoundElement) {
            countdownSoundElement.currentTime = 0;
            countdownSoundElement.play().catch(() => { });
        }
    };

    countdownElement.textContent = "3";
    animateZoom();
    playCountdownTick();

    setTimeout(() => {
        countdownElement.textContent = "2";
        animateZoom();
        playCountdownTick();
    }, 1000);

    setTimeout(() => {
        countdownElement.textContent = "1";
        animateZoom();
        playCountdownTick();
    }, 2000);

    setTimeout(() => {
        countdownElement.textContent = "Go!";
        animateZoom();
        playCountdownTick();
    }, 3000);

    setTimeout(() => {
        countdownOverlay.style.display = "none";
        startQuiz();
    }, 4000);

    setTimeout(() => {
        startSoundElement.currentTime = 0;
        startSoundElement.play().catch(() => { });
    }, 3500);
}

// Start quiz
function startQuiz() {
    // Reset state
    totalPoints = 0;
    correctQuestion = 0;
    addPoints = 0;
    timeLeft = 60;
    currentQuestion = 1;

    doublePointStatus = false;
    addTimeUse = false;
    highStakesStatus = false;
    doublePointUse = false;
    highStakesUse = false;
    powerActiveCurrent = false;

    // BGM
    bgmSoundElement.currentTime = 0;
    bgmSoundElement.volume = 0.3;
    bgmSoundElement.play().catch(() => { });

    nextButton.innerHTML = "Next";
    updatePowerUpStatus();
    currentPointsContainer.innerHTML = '<img src="../assets/images/lesson/star.png" class="me-2" alt="star point" width="30px">' + totalPoints;

    // Start timer after question load to avoid negative UX
    // startTimer();

    // Load & render current question
    loadQuestionData();
}

// Render current question
function loadQuestionData() {
    // Guard if questions not loaded yet or empty
    if (!Array.isArray(questions) || questions.length === 0) {
        questionIdElement.textContent = "No questions available";
        questionElement.textContent = "Please check your course setup.";
        optionsContainer.innerHTML = "";
        nextButton.disabled = true;
        return;
    }

    if (currentQuestion < 1 || currentQuestion > questions.length) {
        // Clamp
        currentQuestion = Math.max(1, Math.min(currentQuestion, questions.length));
    }

    const q = questions[currentQuestion - 1];
    questionIdElement.innerHTML = `Question ${currentQuestion} of ${questions.length}`;
    questionElement.innerHTML = q.question;
    currentPointsContainer.innerHTML = '<img src="../assets/images/lesson/star.png" class="me-2" alt="star point" width="30px">' + totalPoints;

    showOptions(q);
}

// Render options
function showOptions(q) {
    optionsContainer.innerHTML = "";
    const currentOptions = q.options || [];

    currentOptions.forEach((value, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = value;
        btn.addEventListener("click", () => validateAnswer(q, value, index));
        optionsContainer.appendChild(btn);
    });
}

// Validate answer
function validateAnswer(q, option, index) {
    const isCorrect = option === q.correct;

    if (isCorrect) {
        correctSoundElement.currentTime = 0;
        correctSoundElement.play().catch(() => { });

        const earned = (highStakesStatus || doublePointStatus) ? q.point * 2 : q.point;
        totalPoints += earned;
        addPoints = earned;

        correctQuestion++;
        nextButton.disabled = false;
        addPointsElement.innerHTML = `<img src="../assets/images/lesson/star.png" class="me-2" alt="star point" width="30px">+${addPoints}`;

        optionsContainer.children[index].classList.add("correct");
        updatePointDisplay();

        // disable all options
        for (let i = 0; i < q.options.length; i++) {
            optionsContainer.children[i].disabled = true;
        }

        correctModal.show();
        setTimeout(() => {
            correctModal.hide();
        }, 2000);
    } else {
        incorrectSoundElement.currentTime = 0;
        incorrectSoundElement.play().catch(() => { });

        if (highStakesStatus === true) {
            const penalty = q.point * 2;
            totalPoints -= penalty;
            if (totalPoints < 0) {
                totalPoints = 0;
                incorrectReducePoint.innerHTML = "Your points have been reset!";
            } else {
                incorrectReducePoint.innerHTML = `<img src="../assets/images/lesson/star.png" class="me-2" alt="star point" width="30px">-${penalty}`;
            }
        } else {
            incorrectReducePoint.innerHTML = "";
        }

        nextButton.disabled = false;
        updatePointDisplay();

        optionsContainer.children[index].classList.add("incorrect");
        optionsContainer.children[index].style.animationName = "incorrect";

        for (let i = 0; i < q.options.length; i++) {
            optionsContainer.children[i].disabled = true;
        }

        incorrectModal.show();
        setTimeout(() => {
            incorrectModal.hide();
            incorrectReducePoint.innerHTML = "";
        }, 2000);
    }
}

// Next button
nextButton.addEventListener("click", () => {
    // Hide power-up banner and clear current usage
    powerUpAlertBox.classList.add("d-none");
    powerActiveCurrent = false;
    updatePowerUpStatus();

    if (currentQuestion + 1 === questions.length) {
        nextButton.innerText = "Get Result";
    }

    if (currentQuestion < questions.length) {
        nextButton.disabled = true;
        currentQuestion++;
        loadQuestionData();
    } else {
        if (correctQuestion !== 0) {
            displayResultModal("Well Done!");
        } else {
            displayResultModal("You Tried :(");
        }
    }
});

// Points display
function updatePointDisplay() {
    currentPointsContainer.innerHTML = '<img src="../assets/images/lesson/star.png" class="me-2" alt="star point" width="30px">' + totalPoints;
}

// Result content
function updateResultCon(message) {

    resultCon.children[0].innerHTML = message;
    resultCon.children[1].innerHTML = `You answered ${correctQuestion} out of ${questions.length} correctly.`;
    resultCon.children[2].innerHTML = totalPoints <= 1 ? `${totalPoints} Point` : `${totalPoints} Points`;

    // getUserData();
    // if (userHasDoneThisQuiz === false) {
    //     updateUserPoints(totalPoints);
    //     updateUserData();
    // }

    if (((correctQuestion / questions.length) * 100) >= 80) {
        // console.log("pass");
        document.getElementById('nextChapButton').style.display = "inline";
    }
    else {
        // console.log("fail");
        resultCon.children[0].innerHTML = "You scored under 80%. Retry to unlock the next chapter.";
        document.getElementById('nextChapButton').style.display = "none";
    }
}
document.getElementById('nextChapButton').addEventListener('click', function () {
    const { chapterKey, courseId } = parseChapterAndCourseId();
    getUserData();
    if (userHasDoneThisQuiz === false) {
        updateUserPoints(totalPoints);
        updateUserData();

    }
    else {
        window.location.href = `../lesson.html#${courseId}`;
    }
});


// Play again
resultCon.children[3].addEventListener("click", () => {
    resultModal.hide();
    startQuiz();
});

// Result modal
function displayResultModal(message) {
    console.log();

    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
    bgmSoundElement.pause();
    bgmSoundElement.currentTime = 0;

    loadingModal.show();
    setTimeout(() => {
        loadingModal.hide();
        updateResultCon(message);
        finishSoundElement.currentTime = 0;
        finishSoundElement.play().catch(() => { });

        // if (correctQuestion === questions.length && questions.length > 0) {
        //   const congrats = document.getElementById("congratulationSound");
        //   if (congrats) {
        //     congrats.currentTime = 0;
        //     congrats.play().catch(() => {});
        //   }
        // } else if (correctQuestion === 0) {
        //   const tryagain = document.getElementById("tryagainSound");
        //   if (tryagain) {
        //     tryagain.currentTime = 0;
        //     tryagain.play().catch(() => {});
        //   }
        // }

        resultModal.show();
    }, 2500);
}

// Timer
function startTimer() {
    // Clear previous timer if any
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }

    updateTimerDisplay();
    quizTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft > 15) {
            timerDisplay.style.color = "var(--accent-color)";
            timerDisplay.style.backgroundColor = "rgba(13, 253, 21, 0.1)";
        }
        if (timeLeft > 10 && timeLeft <= 15) {
            timerSoundElement.currentTime = 0;
            timerSoundElement.play().catch(() => { });
            timerDisplay.style.color = "orange";
            timerDisplay.style.backgroundColor = "rgba(253, 165, 13, 0.1)";
        }
        if (timeLeft > 0 && timeLeft <= 10) {
            timerDisplay.style.color = "red";
            timerDisplay.style.backgroundColor = "rgba(253, 13, 13, 0.1)";
        }
        if (timeLeft <= 0) {
            alarmSoundElement.currentTime = 0;
            alarmSoundElement.play().catch(() => { });
            clearInterval(quizTimer);
            quizTimer = null;
            displayResultModal(`Time's Up!`);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Power-ups
doublePointsBtn.addEventListener("click", () => {
    if (!powerActiveCurrent) {
        powerUpSoundElement.currentTime = 0;
        powerUpSoundElement.play().catch(() => { });
        doublePointStatus = true;
        doublePointUse = true;
        doublePointsBtn.disabled = true;
        powerActiveCurrent = true;
        powerUpAlertBox.innerHTML = "Double Points enabled ⚡️";
        powerUpAlertBox.classList.remove("d-none");
    } else {
        warningSoundElement.currentTime = 0;
        warningSoundElement.play().catch(() => { });
        showAlertModal("Power up already in use!");
    }
});

addTimeBtn.addEventListener("click", () => {
    if (!powerActiveCurrent) {
        addTimeUse = true;
        addTimeSoundElement.currentTime = 0;
        addTimeSoundElement.play().catch(() => { });
        timeLeft += 60; // add 60 seconds
        addTimeBtn.disabled = true;
        powerActiveCurrent = true;
        timerSoundElement.pause();
        powerUpAlertBox.innerHTML = "Extra Time added ⚡️";
        powerUpAlertBox.classList.remove("d-none");
    } else {
        warningSoundElement.currentTime = 0;
        warningSoundElement.play().catch(() => { });
        showAlertModal("Power up already in use!");
    }
});

highStakesBtn.addEventListener("click", () => {
    if (!powerActiveCurrent) {
        powerUpSoundElement.currentTime = 0;
        powerUpSoundElement.play().catch(() => { });
        highStakesStatus = true;
        highStakesUse = true;
        highStakesBtn.disabled = true;
        powerActiveCurrent = true;
        powerUpAlertBox.innerHTML = "High Stakes enabled ⚡️";
        powerUpAlertBox.classList.remove("d-none");
    } else {
        warningSoundElement.currentTime = 0;
        warningSoundElement.play().catch(() => { });
        showAlertModal("Power up already in use!");
    }
});

function updatePowerUpStatus() {
    powerUpAlertBox.classList.add("d-none");

    doublePointsBtn.disabled = !!doublePointUse;
    addTimeBtn.disabled = !!addTimeUse;
    highStakesBtn.disabled = !!highStakesUse;

    doublePointStatus = false;
    highStakesStatus = false;
}

// Alerts
function showAlertModal(message) {
    const el = document.getElementById("alertMessage");
    if (el) {
        el.innerHTML = message;
    }
    alertModal.show();
    setTimeout(() => {
        alertModal.hide();
    }, 1000);
}


(async function boot() {

    const startBtn = introModalContent?.querySelector("[data-start]") || introModalContent?.children[3];
    if (startBtn) {
        startBtn.addEventListener("click", function () {
            introModal.hide();
            showCountdown();
        });
    }
    introModal.show();

    // Load questions
    questions = await loadQuestionsFromFirestore();

    if (Array.isArray(questions) && questions.length > 0) {
        loadQuestionData();
    }
})();


async function updateUserPoints(point) {
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const userRef = doc(db, "users", firstDoc.id);

    const oldPoint = await getPoint();
    point = point + oldPoint;
    await updateDoc(userRef, {
        star: point,
    });
}

async function getPoint() {

    // const pointDisplay = document.getElementById('pointDisplay');
    const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);
    const userData2 = userSnapshot.docs[0].data();

    return userData2.star;

}

// [
//     {
//         "chapterData": [
//             {
//                 "quizDone": false,
//                 "id": 1,
//                 "mark": 0,
//                 "star": 0,
//                 "notes": ""
//             }
//         ],
//         "doneChap": 0,
//         "totalChap": "1",
//         "id": "SUc2SqL07Ye23LI8jvJP"
//     }
// ]

async function updateUserData() {
    const { chapterKey, courseId } = parseChapterAndCourseId();

    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    let oldCourses = firstDoc.data().courses;
    const userRef = doc(db, "users", firstDoc.id);

    for (let i = 0; i < oldCourses.length; i++) {
        if (oldCourses[i].id === courseId) {

            oldCourses[i].chapterData[chapterKey].quizDone = true;
            oldCourses[i].chapterData[chapterKey].mark = correctQuestion;
            oldCourses[i].chapterData[chapterKey].star = totalPoints;
            oldCourses[i].chapterData[chapterKey].notes = `He answer ${correctQuestion} out of 5 questions correctly. This is for one of the chapter of the course ${document.getElementById('quizDisplayTitle').innerText}. This data will be helpful for suggesting courses.`;
            if ((oldCourses[i].doneChap + 1) <= oldCourses[i].totalChap) {
                oldCourses[i].doneChap = oldCourses[i].doneChap + 1;
            }
            //  console.log(oldCourses[i].chapterData[chapterKey].quizDone);
        }

    }


    await updateDoc(userRef, {
        courses: oldCourses,
    });

    window.location.href = `../lesson.html#${courseId}`;
}

document.getElementById('exitButton').addEventListener('click', function () {
    const { chapterKey, courseId } = parseChapterAndCourseId();
    if (confirm("Are you sure you want to exit?") === true) {
        // document.getElementById('loadingText').innerText = "Exiting Learning Mode";
        // customLoadingScreen.style.display = "flex";
        setTimeout(() => {
            window.location.href = `../lesson.html#${courseId}`;
        }, 3000);
    }
});

let bgSoundPlay = true;
document.getElementById('volumeBtn').addEventListener('click', function () {
    if (bgSoundPlay === true) {
        document.getElementById('volumeBtn').innerHTML = '<i class="bi bi-volume-mute fw-bold" style="font-size: 20px;"></i>';
        bgmSoundElement.pause();
        bgSoundPlay = false;
    }
    else {
        document.getElementById('volumeBtn').innerHTML = '<i class="bi bi-volume-up fw-bold" style="font-size: 20px;"></i>';
        bgmSoundElement.play();
        bgSoundPlay = true;
    }
});