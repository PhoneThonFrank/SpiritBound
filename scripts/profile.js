import { signOutUserExport, exportUserData } from "./auth.js";
import { showToast } from "./toast.js";

// Importing Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
// import { showToast } from "./toast.js";

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
// const user = auth.currentUser;
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});
const db = getFirestore(app);
const userAuth = onAuthStateChanged;

const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));

if (localStorage.getItem('isLoggedIn') === "false") {
    window.location.href = "./home.html";
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
    throw new Error("Failed to fetch user data.");
}

(async () => {
    try {
        userData = await tryExportUserData(5, 500);
        setUserData();
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();

const profilePic = document.getElementById('profilePic');

function setUserData() {
    document.getElementById('emailDisplay').innerHTML = userData.email;
    document.getElementById('nameDisplay').innerHTML = userData.name;
    // console.log(userData);

    if (userData.student === true && userData.volunteer === true) {
        document.getElementById('roleDisplay').innerHTML = "Student & Volunteer";
    } else if (userData.student === true) {
        document.getElementById('roleDisplay').innerHTML = "Student";
    } else if (userData.volunteer === true) {
        document.getElementById('roleDisplay').innerHTML = "Volunteer";
    } else {
        document.getElementById('roleDisplay').innerHTML = "User";
    }
    // document.getElementById('roleDisplay').innerHTML = ;

    // if (userData.pfp === "cow") {
    //     profilePic.classList.add('cow-pfp');
    // }

    switch (userData.pfp) {
        case "cow":
            profilePic.classList.add('cow-pfp');
            profilePic.classList.remove('monkey-pfp');
            profilePic.classList.remove('owl-pfp');
            profilePic.classList.remove('pig-pfp');
            profilePic.classList.remove('frog-pfp');
            break;
        case "monkey":
            profilePic.classList.remove('cow-pfp');
            profilePic.classList.add('monkey-pfp');
            profilePic.classList.remove('owl-pfp');
            profilePic.classList.remove('pig-pfp');
            profilePic.classList.remove('frog-pfp');
            break;
        case "owl":
            profilePic.classList.remove('cow-pfp');
            profilePic.classList.remove('monkey-pfp');
            profilePic.classList.add('owl-pfp');
            profilePic.classList.remove('pig-pfp');
            profilePic.classList.remove('frog-pfp');
            break;
        case "pig":
            profilePic.classList.remove('cow-pfp');
            profilePic.classList.remove('monkey-pfp');
            profilePic.classList.remove('owl-pfp');
            profilePic.classList.add('pig-pfp');
            profilePic.classList.remove('frog-pfp');
            break;
        case "frog":
            profilePic.classList.remove('cow-pfp');
            profilePic.classList.remove('monkey-pfp');
            profilePic.classList.remove('owl-pfp');
            profilePic.classList.remove('pig-pfp');
            profilePic.classList.add('frog-pfp');
            break;
        default:
            profilePic.classList.add('cow-pfp');
            profilePic.classList.remove('monkey-pfp');
            profilePic.classList.remove('owl-pfp');
            profilePic.classList.remove('pig-pfp');
            profilePic.classList.remove('frog-pfp');
            break;
    }

    document.getElementById('nameInput').value = userData.name;
    const select = document.getElementById('pfpSelector');
    switch (userData.pfp) {
        case "cow":
            select.value = 'cow';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'cow');
            });
            break;
        case "frog":
            select.value = 'frog';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'frog');
            });
            break;
        case "monkey":
            select.value = 'monkey';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'monkey');
            });
            break;
        case "owl":
            select.value = 'owl';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'owl');
            });
            break;
        case "pig":
            select.value = 'pig';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'pig');
            });
            break;
        default:
        case "cow":
            select.value = 'cow';
            Array.from(select.options).forEach(opt => {
                opt.selected = (opt.value === 'cow');
            });
            break;
    }
    select.dispatchEvent(new Event('change', { bubbles: true }));

    if (userData.location.indexOf(',') != -1) {
        let commaIndex = userData.location.indexOf(',');
        const state = userData.location.slice(0, commaIndex);
        const township = userData.location.slice(commaIndex + 1);
        // console.log("State: " + state);
        // console.log("Township: " + township);


        const locationSelectorDisplay = document.getElementById('locationSelector');

        switch (state.trim()) {
            case "Ayeyarwady Region":
                locationSelectorDisplay.value = "Ayeyarwady Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Ayeyarwady Region");
                });
                break;

            case "Bago Region":
                locationSelectorDisplay.value = "Bago Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Bago Region");
                });
                break;

            case "Chin State":
                locationSelectorDisplay.value = "Chin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Chin State");
                });
                break;

            case "Kachin State":
                locationSelectorDisplay.value = "Kachin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kachin State");
                });
                break;

            case "Kayah State":
                locationSelectorDisplay.value = "Kayah State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kayah State");
                });
                break;

            case "Kayin State":
                locationSelectorDisplay.value = "Kayin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kayin State");
                });
                break;

            case "Magway Region":
                locationSelectorDisplay.value = "Magway Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Magway Region");
                });
                break;

            case "Mandalay Region":
                locationSelectorDisplay.value = "Mandalay Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Mandalay Region");
                });
                break;

            case "Mon State":
                locationSelectorDisplay.value = "Mon State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Mon State");
                });
                break;

            case "Naypyidaw Union Territory":
                locationSelectorDisplay.value = "Naypyidaw Union Territory";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Naypyidaw Union Territory");
                });
                break;

            case "Rakhine State":
                locationSelectorDisplay.value = "Rakhine State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Rakhine State");
                });
                break;

            case "Sagaing Region":
                locationSelectorDisplay.value = "Sagaing Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Sagaing Region");
                });
                break;

            case "Shan State":
                locationSelectorDisplay.value = "Shan State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Shan State");
                });
                break;

            case "Taninthayi Region":
                locationSelectorDisplay.value = "Taninthayi Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Taninthayi Region");
                });
                break;

            case "Yangon Region":
                locationSelectorDisplay.value = "Yangon Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Yangon Region");
                });
                break;

            default:
                locationSelectorDisplay.value = "";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "");
                });
                break;
        }

        document.getElementById('locationInput').value = township;
    }
    else {
        const locationSelectorDisplay = document.getElementById('locationSelector');

        switch (userData.location.trim()) {
            case "Ayeyarwady Region":
                locationSelectorDisplay.value = "Ayeyarwady Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Ayeyarwady Region");
                });
                break;

            case "Bago Region":
                locationSelectorDisplay.value = "Bago Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Bago Region");
                });
                break;

            case "Chin State":
                locationSelectorDisplay.value = "Chin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Chin State");
                });
                break;

            case "Kachin State":
                locationSelectorDisplay.value = "Kachin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kachin State");
                });
                break;

            case "Kayah State":
                locationSelectorDisplay.value = "Kayah State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kayah State");
                });
                break;

            case "Kayin State":
                locationSelectorDisplay.value = "Kayin State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Kayin State");
                });
                break;

            case "Magway Region":
                locationSelectorDisplay.value = "Magway Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Magway Region");
                });
                break;

            case "Mandalay Region":
                locationSelectorDisplay.value = "Mandalay Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Mandalay Region");
                });
                break;

            case "Mon State":
                locationSelectorDisplay.value = "Mon State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Mon State");
                });
                break;

            case "Naypyidaw Union Territory":
                locationSelectorDisplay.value = "Naypyidaw Union Territory";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Naypyidaw Union Territory");
                });
                break;

            case "Rakhine State":
                locationSelectorDisplay.value = "Rakhine State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Rakhine State");
                });
                break;

            case "Sagaing Region":
                locationSelectorDisplay.value = "Sagaing Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Sagaing Region");
                });
                break;

            case "Shan State":
                locationSelectorDisplay.value = "Shan State";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Shan State");
                });
                break;

            case "Taninthayi Region":
                locationSelectorDisplay.value = "Taninthayi Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Taninthayi Region");
                });
                break;

            case "Yangon Region":
                locationSelectorDisplay.value = "Yangon Region";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "Yangon Region");
                });
                break;

            default:
                locationSelectorDisplay.value = "";
                Array.from(locationSelectorDisplay.options).forEach(opt => {
                    opt.selected = (opt.value === "");
                });
                break;
        }
    }

}

const signOutBtn = document.getElementById('signoutBtn');
signOutBtn.addEventListener('click', function () {
    signOutUserExport();
    localStorage.setItem('isLoggedIn', "false");
    window.location.reload();
});


// Editing Profile
const pfpInput = document.getElementById('pfpSelector');
const pfpPreview = document.getElementById('pfpPreview');
const nameInput = document.getElementById('nameInput');
const stateInput = document.getElementById('locationSelector');
const townshipInput = document.getElementById('locationInput');
const editForm = document.getElementById('editForm');
const editFormElements = editForm.elements;
let location = "";
const updateBtn = document.getElementById('updateBtn');
editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    updateBtn.innerHTML = "Updating...";
    updateBtn.disabled = true;

    // Empty Validation
    let emptyError = false;

    // Profile picture
    if (pfpInput.value === "") {
        showToast("Please select a profile picture", 3000, "toastContainer", "red", "white");
        editFormElements[0].classList.add("is-invalid");
        emptyError = true;
    } else {
        editFormElements[0].classList.remove("is-invalid");
    }

    // Name
    if (nameInput.value === "") {
        showToast("Please enter your name", 3000, "toastContainer", "red", "white");
        editFormElements[1].classList.add("is-invalid");
        emptyError = true;
    } else {
        editFormElements[1].classList.remove("is-invalid");
    }

    // State / Division
    if (stateInput.value === "") {
        showToast("Please select a state/division", 3000, "toastContainer", "red", "white");
        editFormElements[2].classList.add("is-invalid");
        emptyError = true;
    } else {
        editFormElements[2].classList.remove("is-invalid");
    }


    if (emptyError === true) {
        updateBtn.disabled = false;
        updateBtn.innerHTML = "Update";
        return;
    }

    if (townshipInput.value === "") {
        location = stateInput.value;
    }
    else {
        location = `${stateInput.value}, ${townshipInput.value}`;
    }

    // console.log("passed");
    // console.log(emptyError);


    updateUserData();



});

pfpInput.addEventListener('change', function () {
    pfpPreview.src = `./assets/images/profile/${pfpInput.value}.png`;
    if (pfpInput.value == "") {
        pfpPreview.src = `./assets/images/profile/cow.png`;
    }
});

async function updateUserData() {
    const q = query(collection(db, "users"), where("email", "==", userData.email));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const userRef = doc(db, "users", firstDoc.id);
    await updateDoc(
        userRef,
        {
            pfp: pfpInput.value,
            name: nameInput.value,
            location: location,
        }
    );

    updateBtn.innerHTML = "Update";
    updateBtn.disabled = false;
    showToast('Profile updated successfully!', 3000, 'toastContainer', "#88c659", "white");
    loadingModal.show()
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// Change Password
const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordBtn = document.getElementById('changePasswordBtn');

changePasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    changePasswordBtn.disabled = true;
    changePasswordBtn.innerHTML = "Changing Password...";

    const email = userData.email;


    const oldInput = document.getElementById('passwordOld');
    const newInput = document.getElementById('passwordNew');
    const confirmInput = document.getElementById('passwordConfirm');

    const oldPassword = oldInput.value.trim();
    const newPassword = newInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    let emptyError = false;


    if (oldPassword === "") {
        showToast("Please enter your old password", 3000, "toastContainer", "red", "white");
        oldInput.classList.add('is-invalid');
        emptyError = true;
    } else {
        oldInput.classList.remove('is-invalid');
    }


    if (newPassword === "") {
        showToast("Please enter your new password", 3000, "toastContainer", "red", "white");
        newInput.classList.add('is-invalid');
        emptyError = true;
    } else {
        newInput.classList.remove('is-invalid');
    }


    if (confirmPassword === "") {
        showToast("Please confirm your new password", 3000, "toastContainer", "red", "white");
        confirmInput.classList.add('is-invalid');
        emptyError = true;
    } else {
        confirmInput.classList.remove('is-invalid');
    }


    if (!emptyError && newPassword !== confirmPassword) {
        showToast("New password and confirmation do not match", 3000, "toastContainer", "red", "white");
        newInput.classList.add('is-invalid');
        confirmInput.classList.add('is-invalid');
        emptyError = true;
    } else if (!emptyError) {
        newInput.classList.remove('is-invalid');
        confirmInput.classList.remove('is-invalid');
    }

    // console.log(emptyError);

    if (emptyError === true) {
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = "Change Password";
        return;
    }

    if (newPassword.length < 6) {
        newInput.classList.add('is-invalid');
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = "Change Password";
        showToast('Password should be at least 6 characters long', 3000, 'toastContainer', 'red', 'white');
        return;
    }
    //   Password (Mix of characters)
    else if (newPassword.search(/[a-zA-Z]/) < 0 || newPassword.search(/[0-9]/) < 0 || newPassword.search(/[\W_]/) < 0) {
        newInput.classList.add('is-invalid');
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = "Change Password";
        showToast('Password should contain a mix of letters, numbers, and special characters', 3000, 'toastContainer', 'red', 'white');
        return;
    }
    else {
        newInput.classList.remove('is-invalid');
    }
    // console.log(currentUser);

    const credential = EmailAuthProvider.credential(userData.email, oldPassword);
    reauthenticateWithCredential(currentUser, credential)
        .then(() => {
            updatePassword(currentUser, newPassword).then(() => {
                showToast("Password changed successfully!", 3000, "toastContainer", "#88c659", "white");
                changePasswordBtn.disabled = false;
                changePasswordBtn.innerHTML = "Change Password";
                loadingModal.show();
                setTimeout(() => {
                    window.location.reload();
                }, 3000);

            }).catch((error) => {
                // console.warn(error);
                showToast("An unknown error occured", 3000, "toastContainer", "red", "white");
                changePasswordBtn.disabled = false;
                changePasswordBtn.innerHTML = "Change Password";
            });

        })
        .catch((error) => {
            switch (error.code) {
                case "auth/requires-recent-login":
                    showToast("Please sign in again to continue", 3000, "toastContainer", "red", "white");
                    break;
                case "auth/invalid-credential":
                    showToast("Your credential is invalid", 3000, "toastContainer", "red", "white");
                    break;
                case "auth/too-many-requests":
                    showToast("Too many requests! Try again later", 3000, "toastContainer", "red", "white");
                    break;
                default:
                    break;
            }
            changePasswordBtn.disabled = false;
            changePasswordBtn.innerHTML = "Change Password";
        });

    changePasswordBtn.disabled = false;
    changePasswordBtn.innerHTML = "Change Password";
});
