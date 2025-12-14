import { db, currentUserData, exportUserData } from "./auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { showToast } from "./toast.js";


let userData;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryExportUserData(maxAttempts = 5, delayMs = 500) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const data = await exportUserData();
            if (data != null) return data;
        } catch (err) {

        }
        if (attempt < maxAttempts) {
            await sleep(delayMs);
        }
    }
    // throw new Error("Failed to fetch user data.");
}

(async () => {
    try {
        userData = await tryExportUserData(5, 500);
        // setUserData();
        if (userData != undefined) {
            // getUserCurrentCourses();
            validateCourseEnrolled();
            getUserCourseStates(userData);
            refreshPointDisplay(userData);
        }
        else {
            const courseElements = document.getElementsByClassName('course-card');
            window.location.href = "../mycourses.html";
        }
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();




const customLoadingScreen = document.getElementById('customLoadingScreen');
customLoadingScreen.style.display = "flex";
setTimeout(() => {
    customLoadingScreen.style.display = "none";
}, 3000);

// Getting the course id
const fragmentWithHash = window.location.hash;
const fragment = fragmentWithHash.startsWith('#') ? fragmentWithHash.slice(1) : fragmentWithHash;
const currentCourseId = fragment;

async function validateCourseEnrolled() {
    let isValid = false;
    for (let i = 0; i < userData.courses.length; i++) {
        if (currentCourseId == userData.courses[i].id) {
            isValid = true;
        }
    }
    if (isValid === false) {
        window.location.href = "../mycourses.html";
    }
}


if (currentCourseId == "") {
    window.location.href = "../mycourses.html";
}

const courseFSdocRef = doc(db, "course-data", currentCourseId);
const courseData = await getDoc(courseFSdocRef);
if (courseData.exists()) {

} else {
    showToast('Error!', 3000, "toastContainer", "red", "white");
    setTimeout(() => {
        window.location.href = "../mycourses.html";
    }, 3000);
}

// States
let lessonShow = false;
let selectedLesson;
let doneChap = 0;
let chapData;
let chapCount = 0;
function getUserCourseStates(currentData) {
    // console.log("hello");
    for (let i = 0; i < currentData.courses.length; i++) {
        // console.log(currentData.courses[i].id);

        if (currentCourseId === currentData.courses[i].id) {
            doneChap = currentData.courses[i].doneChap;
            chapData = currentData.courses[i].chapterData;
            chapCount = currentData.courses[i].chapterData.length;
            // console.log(doneChap);

        }
    }

    // console.log(doneChap);
    // console.log(chapData);
    loadChapterButtons();

}

// Load the chapter buttons
const chapterButtonCon = document.getElementById('chapterButtonCon');
async function loadChapterButtons() {
    // console.log(courseData.data());

    document.getElementById('chapterOffcanvasLabel').innerText = courseData.data().title;
    chapterButtonCon.innerHTML = "";
    let chapBtnEl;
    for (let i = 1; i <= courseData.data().chapterData.length; i++) {
        if (i <= doneChap) {
            chapBtnEl = `<button style="padding-left: 10px !important;" class="btn  btn-success w-100 text-start my-2 chapSwitchBtn" data-bs-dismiss="offcanvas" chapterId="${i}"><i class="bi bi-check-circle-fill me-2"></i> ${i}. ${courseData.data().chapterData[i - 1].title}</button>`;
        }
        else if (i == doneChap + 1) {
            chapBtnEl = `<button style="padding-left: 10px !important;" class="btn  btn-success w-100 text-start my-2 chapSwitchBtn" data-bs-dismiss="offcanvas" chapterId="${i}"><i class="bi bi-pencil-fill me-2"></i> ${i}. ${courseData.data().chapterData[i - 1].title}</button>`;
        }
        else {
            chapBtnEl = `<button style="padding-left: 10px !important;" class="btn  btn-success w-100 text-start my-2 chapSwitchBtn" data-bs-dismiss="offcanvas" chapterId="${i}" disabled><i class="bi bi-lock me-2"></i>${i}. ${courseData.data().chapterData[i - 1].title}</button>`;
        }

        chapterButtonCon.innerHTML += chapBtnEl;
        // console.log(chapBtnEl);

    }
}


const chapterOffcanvas = new bootstrap.Offcanvas(document.getElementById('chapterOffcanvas'));
chapterOffcanvas.show();

document.addEventListener('click', function (event) {
    const btn = event.target.closest('.chapSwitchBtn');
    if (!btn) return;


    // const buttonId = btn.id;
    const chapId = btn.getAttribute("chapterId");
    showLesson(chapId);
});

let quizStatus = false;
function showLesson(chapterId) {
    // console.log(chapterId);

    if (lessonShow == false) {
        if (selectedLesson != chapterId - 1) {
            const mainLessonContainer = document.getElementById('mainLessonContainer');
            quizStatus = false;
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('quizContainer').innerHTML = '';
            const quizFrame = document.createElement('iframe');
            quizFrame.style.width = "100%";
            quizFrame.style.height = "800px";
            quizFrame.src = `./quiz/index.html#${chapterId - 1}cend${courseData.id}`;

            document.getElementById('quizContainer').appendChild(quizFrame);
            // document.getElementById('quizIframe').src = `./quiz/index.html#${chapterId-1}cend${courseData.id}`;
            let lessonData = courseData.data().chapterData[chapterId - 1].lesson;
            mainLessonContainer.innerHTML = `<h2 class="text-success-dark mb-3 fw-bold">Chapter ${chapterId} - ${courseData.data().chapterData[chapterId - 1].title}</h2>`;
            mainLessonContainer.innerHTML += `
            <iframe width="100%" style="max-width: 560px;" height="315" src="https://www.youtube.com/embed/${courseData.data().chapterData[chapterId - 1].ytVid}?si=l6Kd7YrJGvfM_RQ3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            `;
            mainLessonContainer.innerHTML += lessonData;
            mainLessonContainer.innerHTML += `<button class="d-block m-auto btn btn-lg btn-success mt-3 takeTestButton" id="takeTestButton">Take Test</button>`;
            lessonShow = true;
            selectedLesson = chapterId - 1;
        }
    }
    else {
        if (selectedLesson != chapterId - 1) {
            if (confirm('Are you sure you want to switch to another Chapter?') === true) {
                if (selectedLesson != chapterId - 1) {
                    const mainLessonContainer = document.getElementById('mainLessonContainer');
                    quizStatus = false;
                    document.getElementById('quizContainer').style.display = 'none';
                    document.getElementById('quizContainer').innerHTML = '';
                    const quizFrame = document.createElement('iframe');
                    quizFrame.style.width = "100%";
                    quizFrame.style.height = "800px";
                    quizFrame.src = `./quiz/index.html#${chapterId - 1}cend${courseData.id}`;

                    document.getElementById('quizContainer').appendChild(quizFrame);
                    // document.getElementById('quizIframe').style.display = "none";
                    // document.getElementById('quizIframe').src = '';
                    // document.getElementById('quizIframe').src = `./quiz/index.html#${chapterId-1}cend${courseData.id}`;
                    let lessonData = courseData.data().chapterData[chapterId - 1].lesson;
                    mainLessonContainer.innerHTML = `<h2 class="text-success-dark mb-3 fw-bold">Chapter ${chapterId} - ${courseData.data().chapterData[chapterId - 1].title}</h2>`;
                    mainLessonContainer.innerHTML += `
            <iframe width="100%" style="max-width: 560px;" height="315" src="https://www.youtube.com/embed/${courseData.data().chapterData[chapterId - 1].ytVid}?si=l6Kd7YrJGvfM_RQ3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            `;
                    mainLessonContainer.innerHTML += lessonData;
                    mainLessonContainer.innerHTML += `<button class="d-block m-auto btn btn-lg btn-success mt-3 takeTestButton" id="takeTestButton">Take Test</button>`;
                    lessonShow = true;
                    selectedLesson = chapterId - 1;
                }
            }
        }
    }

}

// document.getElementById('takeTestButton').addEventListener('click', function() {
//     document.getElementById('quizIframe').style.display = "block";
// });

document.addEventListener('click', function (event) {
    const btn = event.target.closest('.takeTestButton');
    if (!btn) return;


    // const buttonId = btn.id;
    // const numOfChap = btn.getAttribute("numOfChap");
    // enrollCourse(buttonId, numOfChap);
    // document.getElementById('quizContainer').style.display = "block";
    window.location.href = `../quiz/index.html#${selectedLesson}cend${currentCourseId}`;
});


document.getElementById('exitButton').addEventListener('click', function () {
    if (confirm("Are you sure you want to exit?") === true) {
        document.getElementById('loadingText').innerText = "Exiting Learning Mode";
        customLoadingScreen.style.display = "flex";
        setTimeout(() => {
            window.location.href = "../mycourses.html";
        }, 3000);
    }
});

document.getElementById('brandText').addEventListener('click', function () {
    if (confirm("Are you sure you want to exit?") === true) {
        document.getElementById('loadingText').innerText = "Exiting Learning Mode";
        customLoadingScreen.style.display = "flex";
        setTimeout(() => {
            window.location.href = "../home.html";
        }, 3000);
    }
});



export async function refreshPointDisplay(userData1) {
    // console.log(userData);
    const pointDisplay = document.getElementById('pointDisplay');
    const userQuery = query(collection(db, "users"), where("email", "==", userData1.email));
    const userSnapshot = await getDocs(userQuery);
    const userData2 = userSnapshot.docs[0].data();

    // console.log(userData2.star);

    pointDisplay.innerText = userData2.star;

}


const cerChapDone = document.getElementById('cerChapDone');
const cerPro = document.getElementById('cerPro');
const cerBtn = document.getElementById('cerBtn');

setTimeout(() => {
    cerChapDone.innerHTML = `Chapter ${doneChap}/${chapCount} completed`;
    cerPro.style.width = (doneChap / chapCount) * 100 + "%";
    cerPro.innerText = (doneChap / chapCount) * 100 + "%";

    if (((doneChap / chapCount) * 100) != 100) {
        cerBtn.disabled = true;
    }

    // document.getElementById('contactSubject').value = "Certificate Request";
    // document.getElementById('contactMessage').value = `Certificate Request For Course "${courseData.data().title}".`;

}, 3000);

