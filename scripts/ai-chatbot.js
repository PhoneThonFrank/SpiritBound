// import { getDataFromFirebase } from "./announcements.js";
import { db, currentUserData, exportUserData } from "./auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let announcements = [];
// getDataFromFirebase();
async function getDataFromFirebase1() {
    // announcements = [];
    const courseCollection = collection(db, "course-data");

    const q = query(collection(db, "announcements"));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {

        for (let i = 0; i < doc.data().announcements.length; i++) {
            announcements.push(doc.data().announcements[i]);

            // console.log(doc.data().announcements[i]);
        }


    });
    // renderList(announcements);
}
getDataFromFirebase1();

const aiMessagesCon = document.getElementById('aiMessagesCon');
const aiMessageForm = document.getElementById('aiMessageForm');
const aiInput = document.getElementById('aiInput');
const signInToPuterMsgBox = document.getElementById('signInToPuterMsgBox');
const signInToPuter = document.getElementById('signInToPuter');
let aiStillAnswering = false;

function loadMessagesFromStorage() {
    try {
        const raw = localStorage.getItem('spiritbound_chat_messages');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveMessagesToStorage() {
    try {
        localStorage.setItem('spiritbound_chat_messages', JSON.stringify(messages));
    } catch {

    }
}

let messages = loadMessagesFromStorage() ?? [
    {
        from: "SpiritBound",
        message: "Hello there! This is the AI bot from SpiritBound. Anything I can help with?",
    },
];

saveMessagesToStorage();

puterUpdateAuthParts();
function puterUpdateAuthParts() {
    if (puter.auth.isSignedIn() === false) {
        aiMessageForm.style.display = "none";
        signInToPuterMsgBox.style.display = "block";
    } else {
        aiMessageForm.style.display = "block";
        signInToPuterMsgBox.style.display = "none";
    }
}

signInToPuter.addEventListener('click', async function () {
    try {
        await puter.auth.signIn();
        puterUpdateAuthParts();
    } catch (error) {
        puterUpdateAuthParts();
    }
});


renderMessages();

function renderMessages() {
    aiMessagesCon.innerHTML = '';
    let messageEl = '';
    messages.forEach(function (value) {
        if (value.from === "SpiritBound") {
            messageEl = `
                   <div class="d-flex justify-content-start my-2">
                        <button class="btn text-start text-success-dark" style="border: 1px solid #76ab4d !important; border-radius: 10px !important;" type="button">
                            <p class="fw-bold">${value.from}</p>
                            <p class="fw-light">${value.message}</p>
                        </button>
                    </div>
                `;
        } else {
            messageEl = `
                   <div class="d-flex justify-content-end my-2">
                        <button class="btn btn-success text-end" style="border-radius: 10px !important;" type="button">
                            <p class="fw-bold">${value.from}</p>
                            <p class="fw-light">${escapeHtml(value.message)}</p>
                        </button>
                    </div>
                `;
        }

        aiMessagesCon.innerHTML += messageEl;
        aiMessagesCon.scrollTo({ top: aiMessagesCon.scrollHeight, behavior: 'smooth' });
    });
}

// Researched for disabling user's html inputs which can break the system
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


function buildApiMessages() {
    // console.log(announcements);

    const apiMessages = [
        {
            "role": "system",
            "content": `You are SpiritBound's assistant. SpiritBound helps with local park revitalization. Communicate using simple HTML for clarity. Follow these formatting rules: use <p>, <strong>, <em>, <ul>, <li>, and <a> where helpful; avoid big heading tags (<h1>, <h2>, <h3>) that could break the design; if a heading is necessary, prefer <h5>, <h6>, or a bold label with <strong>; do not include inline CSS or scripts; keep answers concise but complete and maintain prior conversation context. When relevant, mention: free courses on maintaining local parks; volunteering sessions announced on the Announcements page; donations are accepted to fund our work; volunteers who cannot work on-ground can help online by sharing awareness or our website, creating/teaching courses, or contributing specialized skills (e.g., graphic design for posters). The website has links in ./home.html, ./about-us.html, ./parks.html, ./announcements.html, ./volunteer.html, ./profile.html, ./courses.html, ./mycourses.html. Only answer questions or reply if only user talks about parks. Don't answer any other question. The founders are Arkar Moe Myint, Lu Khant Min, Phone Thon Hlayn, and Thar Pyae Sone. Following is the up to date announcement data. Use this to answer user's request if they ask about latest events. ${JSON.stringify(announcements)}`
        },
        {
            "role": "assistant",
            "content": "<p><strong>SpiritBound Assistant:</strong> How can I help you today?</p>"
        }
    ];

    for (const m of messages) {
        if (m.from === "SpiritBound") {
            apiMessages.push({ role: "assistant", content: m.message });
        } else {
            apiMessages.push({ role: "user", content: m.message });
        }
    }
    return apiMessages;
}


aiMessageForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (aiStillAnswering) return;

    const text = aiInput.value.trim();
    if (!text) return;

    aiStillAnswering = true;

    messages.push({ from: "You", message: text });
    aiInput.value = '';

    messages.push({ from: "SpiritBound", message: "Thinking..." });
    saveMessagesToStorage();
    renderMessages();

    try {
        const apiMessages = buildApiMessages();

        const reply = await puter.ai.chat(apiMessages, {
            model: 'gpt-5-nano'
        });

        messages.pop(); // remove "Thinking..."
        const assistantContent =
            reply?.message?.content ??
            reply?.content ??
            "Sorry, I couldn't generate a response.";

        messages.push({ from: "SpiritBound", message: assistantContent });

    } catch (err) {
        messages.pop(); // remove "Thinking..."
        messages.push({
            from: "SpiritBound",
            message: "Error contacting AI. Please try again later."
        });
        console.error(err);
    } finally {
        saveMessagesToStorage();
        renderMessages();
        aiStillAnswering = false;
    }
});




document.getElementById('aiClearChatButton').addEventListener('click', function () {
    if (window.confirm("Clear chat history?") === true) {
        messages = [
            {
                from: "SpiritBound",
                message: "Hello there! This is the AI bot from SpiritBound. Anything I can help with?",
            },
        ];

        saveMessagesToStorage();
        renderMessages();
    }
});