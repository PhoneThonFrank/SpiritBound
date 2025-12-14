// contact.js

// Importing Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
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
const db = getFirestore(app);

const contactCollection = collection(db, "contacts");

async function createContactDocument({ name, email, subject, message }) {

    return addDoc(contactCollection, {
        name,
        email,
        subject,
        message,
        createdAt: serverTimestamp()
    });
}

// Form elements
const contactForm = document.getElementById("contactForm");
const formElements = contactForm.elements;
const nameEl = document.getElementById("contactName");
const emailEl = document.getElementById("contactEmail");
const subjectEl = document.getElementById("contactSubject");
const messageEl = document.getElementById("contactMessage");
const submitBtn = document.getElementById('contactSubmitBtn');

contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Empty validation
    let hasEmpty = false;
    const fields = [nameEl, emailEl, subjectEl, messageEl];
    const fieldErrors = [
        "Please enter your name!",
        "Please enter your email!",
        "Please enter the subject!",
        "Please enter the message!"
    ];

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!field.value.trim()) {
            field.classList.add("is-invalid");
            showToast(fieldErrors[i], 3000, "toastContainer", "red", "white");
            hasEmpty = true;
        } else {
            field.classList.remove("is-invalid");
        }
    }

    if (hasEmpty) return;

    // Email validation (Regular Expression)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailEl.value.trim())) {
        emailEl.classList.add("is-invalid");
        showToast("Please enter a valid email address", 3000, "toastContainer", "red", "white");
        return;
    } else {
        emailEl.classList.remove("is-invalid");
    }

    // Prepare values
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const subject = subjectEl.value.trim();
    const message = messageEl.value.trim();

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";
        await createContactDocument({ name, email, subject, message });
        showToast("Message sent successfully!", 3000, "toastContainer", "#88c659", "white");

        // Reset form after success
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Message";

        fields.forEach(f => f.classList.remove("is-invalid"));
    } catch (err) {
        // console.error("Failed to send message:", err);
        showToast("Failed to send message. Please try again later.", 4000, "toastContainer", "red", "white");
    }
});
