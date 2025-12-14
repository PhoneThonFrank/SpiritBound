import { db, currentUserData, exportUserData } from "./auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let courseElementsAiFeed = [];
const courseContainer = document.getElementById('courseContainer');

const courseCollection = collection(db, "course-data");

const q = query(collection(db, "course-data"));

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
    // console.log(doc.id, " => ", doc.data());
    // console.log(doc.data().title);

    // console.log(doc.data());

    let catsEle = '';
    for (let i = 0; i < doc.data().categories.length; i++) {
        const cat = `<span class="mt-2 me-2 badge bg-success">${doc.data().categories[i]}</span>`;
        catsEle += cat;
    }

    const courseElement = `
       <div class="col-10 col-sm-6 col-md-4 px-3 my-3 course-card">
    <div class="card h-100 text-start text-success" style="width: 100%; overflow: hidden;">
        <img src="../assets/images/courses/${doc.data().image}.jpg" class="card-img-top"
            alt="${doc.data().description}">
        <div class="card-body">
            <h5 class="card-title">${doc.data().title}</h5>
            <small class="text-secondary">${doc.data().numOfChap} Chapters</small>
            <br>
            <small class="text-secondary"><i class="bi bi-patch-check-fill text-success me-1"></i>
                ${doc.data().certified}
                students certified</small>
            <br>
            <div>${catsEle}</div>
            <br>

        </div>
        <div class="card-footer bg-white">
                <button id="${doc.id}" numOfChap="${doc.data().numOfChap}" type="button"
                class=" w-100 d-block m-auto btn btn-success btn-lg enroll-btn" disabled>Enroll</button>
        </div>
    </div>
</div>
  `;




    courseElementsAiFeed.push(courseElement);
    courseContainer.innerHTML += courseElement;

});
const courseCards = document.getElementsByClassName('course-card');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchCourseInput');

searchInput.addEventListener('input', function () {
    searchCourses();
});

searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    searchCourses();
});

function searchCourses() {
    aiSuggestionCourseContainer.classList.add('d-none');
    const raw = searchInput.value || '';
    const searchValue = raw.trim().toLowerCase();

    const courseCards = document.getElementsByClassName('course-card');

    if (searchValue.length === 0) {
        for (let i = 0; i < courseCards.length; i++) {
            courseCards[i].style.display = '';
        }
        if (suggestedCoursesConShow === true) {
            aiSuggestionCourseContainer.classList.remove('d-none');
        }
        return;
    }

    for (let i = 0; i < courseCards.length; i++) {
        const cardText = courseCards[i].textContent.toLowerCase();

        const matches = cardText.includes(searchValue);

        courseCards[i].style.display = matches ? '' : 'none';
    }
}


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
            letAiSuggestCourses();
            getUserCurrentCourses();
            updateEnrollBtns();
        }
        else {
            const courseElements = document.getElementsByClassName('course-card');
            for (let i = 0; i < courseElements.length; i++) {
                courseElements[i].children[0].children[2].children[0].disabled = true;
                courseElements[i].children[0].children[2].children[0].innerText = "Login to continue";

            }
        }
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();

function updateEnrollBtns() {
    const courseElements = document.getElementsByClassName('course-card');
    for (let i = 0; i < courseElements.length; i++) {
        courseElements[i].children[0].children[2].children[0].disabled = false;
        courseElements[i].children[0].children[2].children[0].innerText = "Enroll";

    }
}

async function getUserCurrentCourses() {
    // console.log(userData);

    const userQuery = query(collection(db, "users"), where("email", "==", userData.email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
        return;
    }

    const doc = userSnapshot.docs[0];
    const data = doc.data();
    // console.log(data.courses);

    return data.courses;
}



async function enrollCourse(courseId, numOfChap) {
    const enrollBtn = document.getElementById(courseId);
    enrollBtn.disabled = true;
    enrollBtn.innerHTML = "Please wait...";

    const q = query(collection(db, "users"), where("email", "==", userData.email));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const userRef = doc(db, "users", firstDoc.id);
    await updateDoc(
        userRef,
        {
            student: true,
        }
    );


    const currentEnrolledCourses = await getUserCurrentCourses();
    console.log(currentEnrolledCourses);
    let updatedCourses = currentEnrolledCourses;
    let eachChapterData = [];
    for (let i = 1; i <= numOfChap; i++) {
        const chapterData = {
            id: i,
            mark: 0,
            quizDone: false,
            star: 0,
            notes: '',
        }
        eachChapterData.push(chapterData);
    };
    const courseToBeAdded = {
        id: courseId,
        doneChap: 0,
        totalChap: numOfChap,
        chapterData: eachChapterData,
    }

    if (currentEnrolledCourses.length > 0) {
        let alreadyThere = false;
        for (let i = 0; i < currentEnrolledCourses.length; i++) {
            if (currentEnrolledCourses[i].id == courseId) {
                alreadyThere = true;
            }
        }

        if (alreadyThere === true) {
            enrollBtn.disabled = false;
            enrollBtn.innerHTML = "Enroll";
            window.location.href = "../mycourses.html";
        }
        else {
            updatedCourses.push(courseToBeAdded);
            const q = query(collection(db, "users"), where("email", "==", userData.email));
            const snap = await getDocs(q);
            const firstDoc = snap.docs[0];
            const userRef = doc(db, "users", firstDoc.id);
            await updateDoc(
                userRef,
                {
                    courses: updatedCourses,
                }
            );
            enrollBtn.disabled = false;
            enrollBtn.innerHTML = "Enroll";
            window.location.href = "../mycourses.html";
        }
    }
    else {
        updatedCourses.push(courseToBeAdded);
        const q = query(collection(db, "users"), where("email", "==", userData.email));
        const snap = await getDocs(q);
        const firstDoc = snap.docs[0];
        const userRef = doc(db, "users", firstDoc.id);
        await updateDoc(
            userRef,
            {
                courses: updatedCourses,
            }
        );
        enrollBtn.disabled = false;
        enrollBtn.innerHTML = "Enroll";
        window.location.href = "../mycourses.html";
    }

}

document.addEventListener('click', function (event) {
    const btn = event.target.closest('.enroll-btn');
    if (!btn) return;


    const buttonId = btn.id;
    const numOfChap = btn.getAttribute("numOfChap");
    enrollCourse(buttonId, numOfChap);
});

const suggestedCourses = document.getElementById('suggestedCourses');
const aiSuggestionCourseContainer = document.getElementById('aiSuggestionCourseContainer');
const suggestCourseBtn = document.getElementById('suggestCourseBtn');
const aiSuggestText = document.getElementById('aiSuggestText');

if (localStorage.getItem('isLoggedIn') === "false") {
    suggestCourseBtn.style.display = "none";
}

let suggestedCoursesConShow = false;
suggestCourseBtn.addEventListener('click', function () {
    if (suggestedCoursesConShow === false) {
        suggestedCoursesConShow = true;
        suggestCourseBtn.innerHTML = `AI Suggested
                            Courses For You <i class="bi bi-caret-up-fill ms-1"></i>`;
        aiSuggestionCourseContainer.classList.toggle('d-none');

    }
    else {
        suggestedCoursesConShow = false;
        suggestCourseBtn.innerHTML = `AI Suggested
                            Courses For You <i class="bi bi-caret-down-fill ms-1"></i>`;
        aiSuggestionCourseContainer.classList.toggle('d-none');
    }
});



async function letAiSuggestCourses() {
    aiSuggestText.innerHTML = `AI Suggested Courses - Processing...`;
    const reply = await puter.ai.chat(`Please choose the best course that suit best the user with the following data. You need to provide back in an array format. The array elements are the id of the course. You need to arrange the array element index depending on how suitable they are. Index 0 the best. You only have to provide 3 courses back. ${JSON.stringify(userData)}, Course data: ${JSON.stringify(courseElementsAiFeed)}`, {
        model: 'gpt-5-nano',
    });

    // const reply = await puter.ai.chat(`Please provide back the user's information ${JSON.stringify(userData)}`, {
    //     model: 'gpt-5-nano',
    // });

    // const reply = await puter.ai.chat(`Please provide back the courses information ${JSON.stringify(courseElementsAiFeed)}`, {
    //     model: 'gpt-5-nano',
    // });

    console.log(JSON.parse(reply.message.content));
    const suggestedIdArray = JSON.parse(reply.message.content);
    // suggestedCourses.innerHTML = reply.message.content;






    const courseCollection = collection(db, "course-data");

    const q = query(collection(db, "course-data"));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        // console.log(doc.data().title);

        // console.log(doc.data());

        let catsEle = '';
        for (let i = 0; i < doc.data().categories.length; i++) {
            const cat = `<span class="mt-2 me-2 badge bg-success">${doc.data().categories[i]}</span>`;
            catsEle += cat;
        }

        const courseElement = `
       <div class="col-10 col-sm-6 col-md-4 px-3 my-3 course-card">
    <div class="card h-100 text-start text-success" style="width: 100%; overflow: hidden;">
        <img src="../assets/images/courses/${doc.data().image}.jpg" class="card-img-top"
            alt="${doc.data().description}">
        <div class="card-body">
            <h5 class="card-title">${doc.data().title}</h5>
            <small class="text-secondary">${doc.data().numOfChap} Chapters</small>
            <br>
            <small class="text-secondary"><i class="bi bi-patch-check-fill text-success me-1"></i>
                ${doc.data().certified}
                students certified</small>
            <br>
            <div>${catsEle}</div>
            <br>

        </div>
        <div class="card-footer bg-white">
                <button id="${doc.id}" numOfChap="${doc.data().numOfChap}" type="button"
                class=" w-100 d-block m-auto btn btn-success btn-lg enroll-btn" disabled>Enroll</button>
        </div>
    </div>
</div>
  `;




        // courseElementsAiFeed.push(courseElement);
        // courseContainer.innerHTML += courseElement;

        if (suggestedIdArray.includes(doc.id) === true) {
            suggestedCourses.innerHTML += courseElement;
        }

    });

    aiSuggestText.innerHTML = `AI Suggested Courses`;
    updateEnrollBtns();
}

