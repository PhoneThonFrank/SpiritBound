// Importing Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { showToast } from "./toast.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGQkIeOEygkt2TzHz9WIkV2Y8zT6hy0lc",
    authDomain: "spirit-bound.firebaseapp.com",
    projectId: "spirit-bound",
    storageBucket: "spirit-bound.firebasestorage.app",
    messagingSenderId: "403783020938",
    appId: "1:403783020938:web:7d5f2d1f86fb2f7d12d873"
};

// Initializing Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
const userAuth = onAuthStateChanged;

// Firestore: Creating a user document (store custom user data)
const usersCollection = collection(db, "users");
async function createUserDocument({ name, email, pfp = "cow", role = "user", heart = 5, heartSetTime = serverTimestamp(), star = 0, intro = false, volunteer = false, student = false, location = "", howHear = "", parkLevel = "", courses = [] }) {
    return addDoc(usersCollection, {
        name,
        email,
        pfp,
        role,
        heart,
        heartSetTime,
        star,
        intro,
        volunteer,
        student,
        location,
        howHear,
        parkLevel,
        courses,
        createdAt: serverTimestamp()
    });
}

// DOM
const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
// const introModal = new bootstrap.Modal(document.getElementById('multiStepModal'));
const introMultiStepModal = new bootstrap.Modal(document.getElementById('introMultiStepModal'));


const registrationModal = new bootstrap.Modal(document.getElementById('registration'));
const registerForm = document.getElementById('registerForm');
const signInText = document.getElementById('signInText');
const registerText = document.getElementById('registerText');
const signOutText = document.getElementById('signOutText');
const myProgressText = document.getElementById('myProgressText');
const profileText = document.getElementById('profileText');
const authDropDownDivider = document.getElementById('authDropDownDivider');
const usernameText = document.getElementById('usernameText');
const navPfp = document.getElementById('navPfp');

// Checking login status from localStorage (Because Firebase Auth might take some time to initialize)
let loginStatus = localStorage.getItem('isLoggedIn') === 'true' ? 'true' : 'false';
localStorage.setItem('isLoggedIn', loginStatus);

if (loginStatus === false) {
    signOut(auth);
}

export function signOutUserExport() {
    signOut(auth);
}

// Updating UI elements based on login status
function updateUiAuthElements() {
    const showWhenLoggedIn = loginStatus === 'true';
    signInText.style.display = showWhenLoggedIn ? 'none' : 'block';
    registerText.style.display = showWhenLoggedIn ? 'none' : 'block';
    signOutText.style.display = showWhenLoggedIn ? 'block' : 'none';
    myProgressText.style.display = showWhenLoggedIn ? 'block' : 'none';
    profileText.style.display = showWhenLoggedIn ? 'block' : 'none';
    authDropDownDivider.style.display = showWhenLoggedIn ? 'block' : 'none';
    usernameText.style.display = showWhenLoggedIn ? 'block' : 'none';
    navPfp.children[0].style.display = showWhenLoggedIn ? 'none' : 'block';
    navPfp.children[1].style.display = showWhenLoggedIn ? 'block' : 'none';
    navPfp.className = showWhenLoggedIn ? 'btn btn-pfp mx-1 dropdown-toggle h-100' : 'btn btn-lg btn-success mx-1 dropdown-toggle h-100';
}
updateUiAuthElements();

// Registration form submission handler
registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    //   Getting form values
    const emailEl = document.getElementById('registerEmail');
    const passwordEl = document.getElementById('registerPassword');
    const confirmPasswordEl = document.getElementById('registerConfirmPassword');
    const nameEl = document.getElementById('registerName');

    //   Trimming and storing values
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    const name = nameEl ? nameEl.value.trim() : "";

    const formElements = registerForm.elements;

    let emptyError = false;
    // Empty validation
    for (let i = 0; i < 4; i++) {
        if (formElements[i].value === '') {
            formElements[i].classList.add('is-invalid');
            if (i == 0) {
                showToast('Please enter your name!', 3000, 'toastContainer', 'red', 'white');
            }
            else if (i == 1) {
                showToast('Please enter your email!', 3000, 'toastContainer', 'red', 'white');
            }
            else if (i == 2) {
                showToast('Please enter your password!', 3000, 'toastContainer', 'red', 'white');
            }
            else {
                showToast('Please fill all the fields!', 3000, 'toastContainer', 'red', 'white');
            }

            emptyError = true;
        } else {
            formElements[i].classList.remove('is-invalid');
        }
    }

    if (emptyError) return;

    //   Email validation (Regular Expression used)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailEl.classList.add('is-invalid');
        showToast('Please enter a valid email address', 3000, 'toastContainer', 'red', 'white');
        return;
    } else {
        emailEl.classList.remove('is-invalid');
    }

    //   Password validation
    // Password Length
    if (password.length < 6) {
        passwordEl.classList.add('is-invalid');
        showToast('Password should be at least 6 characters long', 3000, 'toastContainer', 'red', 'white');
        return;
    }
    //   Password (Mix of characters)
    else if (password.search(/[a-zA-Z]/) < 0 || password.search(/[0-9]/) < 0 || password.search(/[\W_]/) < 0) {
        passwordEl.classList.add('is-invalid');
        showToast('Password should contain a mix of letters, numbers, and special characters', 3000, 'toastContainer', 'red', 'white');
        return;
    }
    else {
        passwordEl.classList.remove('is-invalid');
    }

    // Confirm Password validation
    if (password !== confirmPassword) {
        confirmPasswordEl.classList.add('is-invalid');
        showToast('Passwords do not match', 3000, 'toastContainer', 'red', 'white');
        return;
    } else {
        confirmPasswordEl.classList.remove('is-invalid');
    }

    // UI Update
    formElements[4].disabled = true;
    formElements[4].innerText = 'Registering...';


    // Main Registration Logic
    try {
        // (1) Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // (2) Create user in Firestore
        const docRef = await createUserDocument({
            name: name || user.displayName || "",
            email: user.email,
            pfp: "cow",
            intro: false,
            volunteer: false,
            continent: "",
            howHear: "",
            courses: []
        });

        // (3) Success
        showToast('Registration successful! You can now log in.', 3000, 'toastContainer', '#88c659', 'white');
        registerForm.reset();
        const glassContainer = document.getElementById('glassContainer');
        glassContainer.classList.remove('right-panel-active');

        // Sign out (So that user can log in again)
        try {
            await signOut(auth);
            localStorage.setItem('isLoggedIn', 'false');
        } catch { /* Sign out errors will be ignored */ }

        // UI update
        formElements[4].disabled = false;
        formElements[4].innerText = 'Register';

        // console.log('User registered:', user.uid);
        // console.log('Firestore doc created with ID:', docRef.id);

    } catch (error) {
        // Showing errors (Firebase Auth and Firestore)
        let errorText = 'An unexpected error occurred. Please try again later.';

        // Logic Explanation:
        // Firebase Auth errors have 'code' so we can do specific error handling but Firestore errors do not have 'code', only 'message'

        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorText = 'The email address is already in use by another account.';
                    break;
                case 'auth/invalid-email':
                    errorText = 'The email address is not valid.';
                    break;
                case 'auth/operation-not-allowed':
                    errorText = 'Operation not allowed. Please contact support.';
                    break;
                case 'auth/weak-password':
                    errorText = 'The password is too weak. Your password should be at least 6 characters long and contain a mix of letters, numbers, and special characters.';
                    break;
                default:
                    errorText = `Error: ${error.message || 'Unknown error'}`;
            }
        } else {
            // Showing Firestore errors
            errorText = `Firestore error: ${error.message || 'Unknown error'}`;
        }

        // UI update
        showToast(errorText, 3000, 'toastContainer', 'red', 'white');
        formElements[4].disabled = false;
        formElements[4].innerText = 'Register';

        // console.error('Registration/Firestore error:', error);
    }
});

// Login form submission handler
// DOM
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailEl = document.getElementById('loginEmail');
    const passwordEl = document.getElementById('loginPassword');
    const formElements = loginForm.elements;

    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();

    // Empty Validation
    let emptyError = false;
    for (let i = 0; i < 2; i++) {
        if (formElements[i].value === '') {
            formElements[i].classList.add('is-invalid');
            if (i == 0) {
                showToast('Please enter your email!', 3000, 'toastContainer', 'red', 'white');
            }
            else if (i == 1) {
                showToast('Please enter your password!', 3000, 'toastContainer', 'red', 'white');
            }
            else {
                showToast('Please fill all the fields!', 3000, 'toastContainer', 'red', 'white');
            }
            emptyError = true;
        } else {
            formElements[i].classList.remove('is-invalid');
        }
    }

    if (emptyError) return;


    //   Email validation (Regular Expression used)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailEl.classList.add('is-invalid');
        showToast('Please enter a valid email address', 3000, 'toastContainer', 'red', 'white');
        return;
    } else {
        emailEl.classList.remove('is-invalid');
    }


    // Main Login Function

    // UI update
    formElements[3].disabled = true;
    formElements[3].innerText = "Logging In...";
    let errorText = 'Login failed! Please try again!'
    try {
        const singInUser = await signInWithEmailAndPassword(auth, email, password);
        showToast('Login successful! Welcome back!', 3000, 'toastContainer', '#88c659', 'white');
        loginForm.reset();

        formElements[3].disabled = false;
        formElements[3].innerText = "Login";
        localStorage.setItem('isLoggedIn', 'true');
        registrationModal.hide();
        loadingModal.show();
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
    catch (error) {

        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-credential':
                    errorText = 'Email or password is wrong!';
                    break;
                case 'auth/too-many-requests':
                    errorText = 'Too many requests! Try again later.';
                    break;
                default:
                    errorText = 'Login failed! Please try again!';
            }
        }
        else {
            errorText = 'Login failed! Please try again!'
        }


        showToast(errorText, 3000, 'toastContainer', 'red', 'white');
        formElements[3].disabled = false;
        formElements[3].innerText = "Login";
    }


});













// Handling Socials
document.getElementsByClassName('social-sign')[0].addEventListener('click', function () {
    showToast('Continuing with social accounts not available yet. Check back soon!', 3000, 'toastContainer', 'orange', 'white');
});

document.getElementsByClassName('social-sign')[1].addEventListener('click', function () {
    showToast('Continuing with social accounts not available yet. Check back soon!', 3000, 'toastContainer', 'orange', 'white');
});



// Handling Sign Out
signOutText.addEventListener('click', function () {
    signOut(auth);
    localStorage.setItem('isLoggedIn', 'false');
    loginStatus = localStorage.getItem('isLoggedIn');
    updateUiAuthElements();
});

// setTimeout(() => {
//     sendPasswordResetEmail(auth, 'phonethonhlain22@gmail.com')
//         .then(() => {
//             console.log('done');

//         })
//         .catch((error) => {
//             console.log('fail');

//         })
// }, 3000);

// Password Reset
const passwordResetLinkSendBtn = document.getElementById('passwordResetLinkSendBtn');
let passwordResetErrorText = 'Someting went wrong!';
passwordResetLinkSendBtn.addEventListener('click', function () {
    const passwordResetInput = document.getElementById('passwordResetEmail');
    const passwordResetEmail = passwordResetInput.value.trim();

    passwordResetLinkSendBtn.disabled = true;
    passwordResetLinkSendBtn.innerText = "Sending";

    //   Email validation (Regular Expression used)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(passwordResetEmail)) {
        passwordResetInput.classList.add('is-invalid');
        showToast('Please enter a valid email address', 3000, 'toastContainer', 'red', 'white');
        passwordResetLinkSendBtn.disabled = false;
        passwordResetLinkSendBtn.innerText = "Send";
        return;
    } else {
        passwordResetInput.classList.remove('is-invalid');
    }


    sendPasswordResetEmail(auth, passwordResetEmail)
        .then(() => {
            // console.log('done');
            showToast('Password reset link sent successfully!', 3000, 'toastContainer', '#88c659', 'white');
            passwordResetLinkSendBtn.disabled = false;
            passwordResetLinkSendBtn.innerText = "Send";
        })
        .catch((error) => {
            if (error.code) {
                switch (error.code) {
                    case 'auth/too-many-requests':
                        passwordResetErrorText = 'Too many requests! Try again later.';
                        break;
                    default:
                        passwordResetErrorText = 'Something went wrong!';
                }
            }
            else {
                passwordResetErrorText = 'Something went wrong!';
            }


            showToast(passwordResetErrorText, 3000, 'toastContainer', 'red', 'white');
            console.log('fail');
            passwordResetLinkSendBtn.disabled = false;
            passwordResetLinkSendBtn.innerText = "Send";
        });
});



// If user is signed in, we will store their information in variables
let userId = "";
let userEmail = "";
let userName = "";
let userPfp = "";
let userLocation = "";
let userVolunteer = "";
let userStudent = "";
let userIntro = "";
let userCourses = [];
let userCreated = "";
let userData = [];
let userRole = "user";

// export function exportUserEmail() {
//     return userEmail;
// }

// async function (getUserDataFirestore => {
//     const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
//     const userSnapshot = await getDocs(q);
//     userSnapshot.forEach(d => console.log(d.id, d.data()));
// )};


async function getUserDataFirestore() {
    try {
        const userQuery = query(collection(db, "users"), where("email", "==", userEmail));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            throw new Error("No user document found for email: " + userEmail);
        }

        const doc = userSnapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            name: data.name ?? "",
            pfp: data.pfp ?? "cow",
            location: data.location ?? "",
            volunteer: data.volunteer ?? false,
            student: data.student ?? false,
            intro: data.intro ?? false,
            courses: Array.isArray(data.courses) ? data.courses : [],
            role: data.role ?? "user",
        };
    } catch (err) {

        throw err;
    }
}

let userDataExport;

onAuthStateChanged(auth, async (user) => {
    if (user) {

        userId = user.uid;
        userEmail = user.email;


        loadingModal.show();

        try {
            const loaded = await getUserDataFirestore();

            userDataExport = loaded;
            userName = loaded.name;
            userPfp = loaded.pfp;
            userLocation = loaded.location;
            userStudent = loaded.student;
            userVolunteer = loaded.volunteer;
            userIntro = loaded.intro;
            userCourses = loaded.courses;
            userRole = loaded.role;


            setUserDataInDOM(loaded);
        } catch (error) {
            // console.error("Failed to load user data:", error);
            showToast("Could not load your profile. Please try refreshing.", 4000, 'toastContainer', "red", "white");
            // localStorage.setItem('isLoggedIn', "false");
        } finally {

            loadingModal.hide();
        }
    } else {
        // console.warn("No current user");
        localStorage.setItem('isLoggedIn', "false");

        if (typeof loadingModal?.hide === "function") {
            loadingModal.hide();
        }
    }
});


function setUserDataInDOM(loaded) {

    usernameText.innerText = loaded.name;
    navPfp.children[1].src = `./assets/images/profile/${loaded.pfp}.png`;

    const contactNameEl = document.getElementById('contactName');
    const contactEmailEl = document.getElementById('contactEmail');
    if (contactNameEl) contactNameEl.value = loaded.name;
    if (contactEmailEl) contactEmailEl.value = userEmail;

    const loginStatus = localStorage.getItem('isLoggedIn');

    if (!loaded.name) {
        if (loginStatus !== "false") {
            showToast("System error! Refresh to try again.", 3000, 'toastContainer', "red", "white");
        }
        return;
    }

    if (loginStatus === "true") {

        if (loaded.intro !== true) {
            introMultiStepModal.show();
            renderMultiStepQuestions();
        }
    }
}


// Multi-step form
// DOM
const nextBtn = document.getElementById('multi-step-start-btn');
const backBtn = document.getElementById('multi-step-back-btn');
const multiStepModalBs = new bootstrap.Modal(document.getElementById('introMultiStepModal'));
const multiStepTitle = document.getElementById('multi-step-title');
const multiStepProgress = document.getElementById('multi-step-progress');

const stateOrDivision = document.getElementById('location');
const township = document.getElementById('township-input');
const howFind = document.getElementById('how-find');
const experienceLevel = document.getElementById('experience-level');

// Question Con
const multiStepQ1 = document.getElementById('multi-step-1');
const multiStepQ2 = document.getElementById('multi-step-2');
const multiStepQ3 = document.getElementById('multi-step-3');
const multiStepQ4 = document.getElementById('multi-step-4');
const multiStepQ5 = document.getElementById('multi-step-5');

// Variables
let step = 1;
let information = {};

// Render the questions
function renderMultiStepQuestions() {
    if (step === 1) {
        multiStepQ1.classList.remove('d-none');
        multiStepQ2.classList.add('d-none');
        multiStepQ3.classList.add('d-none');
        multiStepQ4.classList.add('d-none');
        multiStepQ5.classList.add('d-none');

        multiStepTitle.innerHTML = "Welcome";
        backBtn.disabled = true;
        backBtn.style.opacity = "0";
        nextBtn.innerHTML = "Start";
        multiStepProgress.style.width = "20%";
        multiStepProgress.innerHTML = "Welcome";
    }
    else if (step === 2) {
        multiStepQ1.classList.add('d-none');
        multiStepQ2.classList.remove('d-none');
        multiStepQ3.classList.add('d-none');
        multiStepQ4.classList.add('d-none');
        multiStepQ5.classList.add('d-none');

        multiStepTitle.innerHTML = "location";
        backBtn.disabled = false;
        backBtn.style.opacity = "1";
        nextBtn.innerHTML = "Next";
        multiStepProgress.style.width = "40%";
        multiStepProgress.innerHTML = "Country";
    }
    else if (step === 3) {
        multiStepQ1.classList.add('d-none');
        multiStepQ2.classList.add('d-none');
        multiStepQ3.classList.remove('d-none');
        multiStepQ4.classList.add('d-none');
        multiStepQ5.classList.add('d-none');

        multiStepTitle.innerHTML = "How Did You Find Us?";
        backBtn.disabled = false;
        backBtn.style.opacity = "1";
        nextBtn.innerHTML = "Next";
        multiStepProgress.style.width = "60%";
        multiStepProgress.innerHTML = "Find Us";
    }
    else if (step === 4) {
        multiStepQ1.classList.add('d-none');
        multiStepQ2.classList.add('d-none');
        multiStepQ3.classList.add('d-none');
        multiStepQ4.classList.remove('d-none');
        multiStepQ5.classList.add('d-none');

        multiStepTitle.innerHTML = "Your Park Level Assessment";
        backBtn.disabled = false;
        backBtn.style.opacity = "1";
        nextBtn.innerHTML = "Next";
        multiStepProgress.style.width = "80%";
        multiStepProgress.innerHTML = "Level";
    }
    else if (step === 5) {
        multiStepQ1.classList.add('d-none');
        multiStepQ2.classList.add('d-none');
        multiStepQ3.classList.add('d-none');
        multiStepQ4.classList.add('d-none');
        multiStepQ5.classList.remove('d-none');

        multiStepTitle.innerHTML = "Thank You!";
        backBtn.disabled = false;
        backBtn.style.opacity = "1";
        nextBtn.innerHTML = "Finish";
        multiStepProgress.style.width = "100%";
        multiStepProgress.innerHTML = "Finish";
    }
}

nextBtn.addEventListener('click', function () {
    if (step === 5) introMultiStepModal.hide();
    if (valdiateMultiStepQuestion() != false) {
        step++;
        renderMultiStepQuestions();
    }
    if (step === 5) {
        // information.location = stateOrDivision.value + ", " + township.value;
        township.value === '' ? information.location = stateOrDivision.value : information.location = stateOrDivision.value + ", " + township.value;
        information.howFind = howFind.value;
        information.experienceLevel = experienceLevel.value;
        // console.log(information);

        updateUserDetailMulti();
    }
});

backBtn.addEventListener('click', function () {
    step--;
    renderMultiStepQuestions();
});

// Validate Each Question
function valdiateMultiStepQuestion() {
    if (step === 2) {
        if (stateOrDivision.value === '') {
            stateOrDivision.classList.add('is-invalid');
            showToast('Please enter your location', "3000", "toastContainer", "red", "white");
            return false;
        }
        else {
            stateOrDivision.classList.remove('is-invalid');
        }
    }
    else if (step === 3) {
        if (howFind.value === '') {
            howFind.classList.add('is-invalid');
            showToast('Please choose one option!', "3000", "toastContainer", "red", "white");
            return false;
        }
        else {
            howFind.classList.remove('is-invalid');
        }
    }

    else if (step === 4) {
        if (experienceLevel.value === '') {
            experienceLevel.classList.add('is-invalid');
            showToast('Please choose one option!', "3000", "toastContainer", "red", "white");
            return false;
        }
        else {
            experienceLevel.classList.remove('is-invalid');
        }
    }
}

async function updateUserDetailMulti() {
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const userRef = doc(db, "users", firstDoc.id);
    await updateDoc(
        userRef,
        {
            intro: true,
            location: information.location,
            howHear: information.howFind,
            parkLevel: information.experienceLevel,
        }
    );
}
export async function exportUserData() {
    userDataExport.email = userEmail;
    userDataExport.student = userStudent;
    userDataExport.pfp = userPfp;
    userDataExport.location = userLocation;
    userDataExport.role = userRole;
    return userDataExport;
}

export const currentUserData = userDataExport;

setTimeout(() => {
    document.getElementById('loadingModal').children[0].children[0].children[0].innerHTML += `<p class="mt-2">Taking so long? <span onclick="window.location.reload()" class="text-success-dark" style="cursor:pointer;">Refesh</span></p>`;
}, 10000);

// let announcements = [];
// let courses = [];
// const announcementsSearchResult = document.getElementById('announcementsSearchResult');

// const navSearchGroup = document.getElementById('nav-search-group');
// navSearchGroup.children[0].addEventListener('focus', function () {

//     async function getDataFromFirebase() {
//         // announcements = [];
//         const courseCollection = collection(db, "course-data");

//         const q = query(collection(db, "announcements"));

//         const querySnapshot = await getDocs(q);
//         querySnapshot.forEach((doc) => {

//             for (let i = 0; i < doc.data().announcements.length; i++) {
//                 announcements.push(doc.data().announcements[i]);

//                 console.log(doc.data().announcements[i]);
//             }


//         });
//     }

//     getDataFromFirebase();


//     async function getDataFromFirebase1() {
//         // announcements = [];

//         const q = query(collection(db, "course-data"));

//         const querySnapshot = await getDocs(q);
//         querySnapshot.forEach((doc) => {

//             for (let i = 0; i < doc.data().length; i++) {
//                 console.log(doc.data()[i]);
//             }


//         });
//     }

//     getDataFromFirebase1();



//     const searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
//     searchModal.show();
// });

// document.getElementById('searchFormSubmit').addEventListener('submit', function (e) {
//     e.preventDefault();
//     const searchTerm = document.getElementById('formSearchInput').value;

//     announcements.forEach(function (value) {
//         if (value.desc.includes(searchTerm) === true) {
//             announcementsSearchResult.innerHTML += `
//                   <div class="card">
//                                 <div class="card-header">
//                                     ${value.title}
//                                 </div>
//                                 <div class="card-body">
//                                     ${value.desc}
//                                 </div>
//                             </div>
//             `
//         }

//     });

// });