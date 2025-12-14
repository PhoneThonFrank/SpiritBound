import { showToast } from "./toast.js";
import { db, currentUserData, exportUserData } from "./auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const donationSuccessModal = new bootstrap.Modal(document.getElementById('donationSuccessModal'));
const donationForm = document.getElementById('donationForm');
const senderName = document.getElementById('senderName');
const paymentSelector = document.getElementById('paymentSelector');
const accountInfo = document.getElementById('accountInfo');
const amount = document.getElementById('amount');
const notes = document.getElementById('notes');
const paymentReceipt = document.getElementById('paymentReceipt');
const submitBtn = document.getElementById('submitBtn');

donationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate sender name
    if (senderName.value.trim() === '') {
        showToast(`Please enter sender's name`, "3000", "toastContainer", "red", "white");
        senderName.classList.add('is-invalid');
        return;
    } else {
        senderName.classList.remove('is-invalid');
    }

    // Validate payment method
    if (paymentSelector.value.trim() === '') {
        showToast(`Please select a payment method`, "3000", "toastContainer", "red", "white");
        paymentSelector.classList.add('is-invalid');
        return;
    } else {
        paymentSelector.classList.remove('is-invalid');
    }

    // Validate amount 
    const amountValue = Number(String(amount.value).replace(/[, ]+/g, ''));
    if (!Number.isFinite(amountValue) || amountValue < 1000) {
        showToast(`Please enter amount greater than 1000 Ks`, "3000", "toastContainer", "red", "white");
        amount.classList.add('is-invalid');
        return;
    } else {
        amount.classList.remove('is-invalid');
    }

    // Validate notes
    if (notes.value.trim() === '') {
        showToast(`Please enter notes`, "3000", "toastContainer", "red", "white");
        notes.classList.add('is-invalid');
        return;
    } else {
        notes.classList.remove('is-invalid');
    }

    // Validate payment receipt (file input)
    const hasReceipt = paymentReceipt.files && paymentReceipt.files.length > 0;
    if (!hasReceipt) {
        showToast(`Please upload payment receipt`, "3000", "toastContainer", "red", "white");
        paymentReceipt.classList.add('is-invalid');
        return;
    } else {
        paymentReceipt.classList.remove('is-invalid');
    }

    donationSuccessModal.show();
    donationForm.reset();
});


paymentSelector.addEventListener('input', function () {
    // console.log(paymentSelector.value);

    switch (paymentSelector.value) {
        case "ayapay":
            accountInfo.innerHTML = `Account Number: 09111222333 <br> Account Name: Arkar Moe Myint`;
            break;
        case "cbpay":
            accountInfo.innerHTML = `Account Number: 09222333444 <br> Account Name: Lu Khant Min`;
            break;
        case "kpay":
            accountInfo.innerHTML = `Account Number: 09333444555 <br> Account Name: Phone Thon Hlayn`;
            break;
        case "wavepay":
            accountInfo.innerHTML = `Account Number: 09444555666 <br> Account Name: Thar Pyae Sone`;
            break;
        default:
            accountInfo.innerHTML = `An error occured`;
            break;
    }

});

paymentSelector.dispatchEvent(new Event('input', { bubbles: true }));


let userData;
let isVolunteer = false;

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
            // letAiSuggestCourses();
            // getUserCurrentCourses();
            // updateEnrollBtns();

            isVolunteer = userData.volunteer;

            if (isVolunteer === false) {
                registerAsVolunteerCon.classList.toggle('d-none');
            }
            else {
                alreadyVolunteerCon.classList.toggle('d-none');
            }

        }
        else {
            accountNeededCon.classList.toggle('d-none');
            // const courseElements = document.getElementsByClassName('course-card');
        }
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();

const registerAsVolunteerCon = document.getElementById('registerAsVolunteerCon');
const accountNeededCon = document.getElementById('accountNeededCon');
const alreadyVolunteerCon = document.getElementById('alreadyVolunteerCon');

function updateRegisterModal() {
    if (localStorage.getItem('isLoggedIn') === "false") {
        accountNeededCon.classList.toggle('d-none');
    }
    else {
        if (isVolunteer === false) {
            registerAsVolunteerCon.classList.toggle('d-none');
        }
        else {
            alreadyVolunteerCon.classList.toggle('d-none');
        }
    }
}

document.getElementById('joinVolunteerBtn').addEventListener('click', async function () {
    const q = query(collection(db, "users"), where("email", "==", userData.email));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const userRef = doc(db, "users", firstDoc.id);
    await updateDoc(
        userRef,
        {
            volunteer: true,
        }
    );
    alert("Congrats! You have successfully registered as a volunteer.");
    window.location.reload();
});