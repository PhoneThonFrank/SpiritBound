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
        if (userData != undefined) {
                   renderEnrolledCourses();
        }
        else {
            window.location.href = "../courses.html";
        }
        
 
        // setUserData();
        // getUserCurrentCourses();
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();

// Render enrolled courses
const enrolledCoursesContainer = document.getElementById('enrolledCoursesContainer');
let enrolledCount = 0;
async function renderEnrolledCourses() {
    const querySnapshot = await getDocs(collection(db, "course-data"));
    querySnapshot.forEach((doc) => {
        for (let i = 0; i < userData.courses.length; i++) {
            if (doc.id == userData.courses[i].id) {
                enrolledCount++;
                let buttonText = "Continue";
                if (((userData.courses[i].doneChap/doc.data().numOfChap)*100) === 100) {
                    // buttonText = "Get Certificate";
                    buttonText = "Completed";
                }
                else {
                    buttonText = "Continue";
                }

                const courseElement = `
                               <div class="col-10 col-sm-6 col-md-4 px-3 my-3">
                        <div class="card overflow-hidden h-100">
                            <div class="card-body p-0">
                                <img src="./assets/images/courses/${doc.data().image}.jpg" alt="${doc.data().description}" class="card-img-top">
                            </div>
                            <div class="card-footer pb-3">
                                <h5 class="text-success fw-bold mb-0">${doc.data().title}</h5>
                                
                                    <div class="mt-2">
                                        <small class="text-success">Chapter ${userData.courses[i].doneChap}/${doc.data().numOfChap} completed</small>
                                        <div class="progress mt-1" role="progressbar" style="border-radius: 1.5rem;">
                                            <div class="progress-bar bg-success"
                                                style="width: ${(userData.courses[i].doneChap/doc.data().numOfChap)*100}%; border-radius: 1.5rem;">
                                                ${(userData.courses[i].doneChap/doc.data().numOfChap)*100}%</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-success d-block m-auto mt-3 ContinueBtn" id="${doc.id}">${buttonText}</button>
                             

                            </div>
                        </div>
                    </div>
            `;
            enrolledCoursesContainer.innerHTML += courseElement;
            }
        }
    });

    if (enrolledCount <= 0) {
        enrolledCoursesContainer.innerHTML = `<p class="text-center text-success">You haven't enrolled any course yet!</p>`;
    }

}

document.addEventListener('click', function (event) {
    const btn = event.target.closest('.ContinueBtn');
    if (!btn) return;


    const buttonId = btn.id;

    window.location.href = `../lesson.html#${buttonId}`;
});

const contactUsModal = new bootstrap.Modal(document.getElementById('contactUsModal'));
document.getElementById('submitCertificateReqBtn').addEventListener('click', function() {
    contactUsModal.show();
    document.getElementById('contactSubject').value = "Certificate Request For Completed Courses";
    document.getElementById('contactMessage').value = "I want to request the completion certificate for the /Level/ courses.";
});

document.getElementById('contactForm').addEventListener('submit', function() {
    showToast("Certificate requested successfully! You can wait and check the certificate section in Profile page.", "3000", "toastContainer", "#88c659", "white")
});
