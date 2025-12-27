import { showToast } from "./toast.js";
import { db, currentUserData, exportUserData } from "./auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let announcements = [];
export async function getDataFromFirebase() {
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
    renderList(announcements);
    updateJoinEventBtns();
}

getDataFromFirebase();



function formatDateToDisplay(dateString) {
    const safeISOString = dateString + "T00:00";
    const dateObject = new Date(safeISOString);
    const formatted = dateObject.toLocaleDateString(
        undefined,
        { year: "numeric", month: "short", day: "numeric" }
    );
    return formatted;
}


function createEventCardElement(event) {
    const column = document.createElement("div");
    column.className = "col-12 col-md-6";

    const card = document.createElement("div");
    card.className = "card p-3 card-event shadow-sm";


    const dateDisplay = formatDateToDisplay(event.date);
    card.innerHTML = `
      <div class="d-flex align-items-start gap-3">
        <div class="flex-shrink-0 text-success" style="font-size:1.45rem">
          <i class="bi bi-flag-fill"></i>
        </div>
        <div class="flex-grow-1 w-75">
          <div class="d-flex justify-content-between align-items-start text-success">
            <div>
              <h5 class="mb-1">${event.title}</h5>
              <div class="muted-sm">${dateDisplay} • ${event.time} • ${event.place}</div>
            </div>
            <div class="text-end">
              <span class="tag">${event.type}</span>
            </div>
          </div>
          <p class="mb-0 mt-2 text-success-dark text-truncate">${event.desc}</p>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <div>
              <a href="#" class="m-2 btn btn-success detailShowBtn" data-id="${event.id}">
                <i class="bi bi-info-circle"></i> Details
              </a>
             <span class="join-event-btn-cover"> <button id="event${event.id}" event-name="${event.title}" event-id="${event.id}" event-date="${event.date}" class="m-2 btn btn-success join-event-btn">Join Event</button></span>
            </div>
            <small class="text-success">Posted • ${dateDisplay}</small>
          </div>
        </div>
      </div>
    `;

    column.appendChild(card);
    return column;
}


function renderList(list) {
    const announcementsContainer = document.getElementById("announcements");
    const noResultsElement = document.getElementById("noResults");


    if (announcementsContainer) {
        announcementsContainer.innerHTML = "";
    }


    if (!Array.isArray(list) || list.length === 0) {
        if (noResultsElement) {
            noResultsElement.classList.remove("d-none");
        }
        return;
    }


    if (noResultsElement) {
        noResultsElement.classList.add("d-none");
    }


    for (let i = 0; i < list.length; i++) {
        const event = list[i];
        const cardElement = createEventCardElement(event);
        if (announcementsContainer) {
            announcementsContainer.appendChild(cardElement);
        }
    }
}


function openModal(clickEvent) {
    if (clickEvent && typeof clickEvent.preventDefault === "function") {
        clickEvent.preventDefault();
    }

    const triggerElement = clickEvent.currentTarget;
    const idAttribute = triggerElement ? triggerElement.getAttribute("data-id") : null;
    const eventId = idAttribute ? Number(idAttribute) : NaN;

    if (!Number.isFinite(eventId)) {
        return;
    }

    const eventData = announcements.find(function (item) {
        return item.id === eventId;
    });

    if (!eventData) {
        return;
    }


    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const modalPlace = document.getElementById("modalPlace");
    const modalExtras = document.getElementById("modalExtras");

    if (modalTitle) modalTitle.textContent = eventData.title;
    if (modalDesc) modalDesc.textContent = eventData.desc;
    if (modalDate) modalDate.textContent = formatDateToDisplay(eventData.date);
    if (modalTime) modalTime.textContent = eventData.time;
    if (modalPlace) modalPlace.textContent = eventData.place;

    if (modalExtras) {
        const tagsArray = Array.isArray(eventData.tags) ? eventData.tags : [];
        const tagsHtml = tagsArray
            .map(function (tag) {
                return `<span class="tag me-1">${tag}</span>`;
            })
            .join(" ");
        modalExtras.innerHTML = tagsHtml;
    }


    const eventModalElement = document.getElementById("eventModal");
    if (eventModalElement) {
        const modalInstance = new bootstrap.Modal(eventModalElement);
        modalInstance.show();
    }
}


const searchInputElement = document.getElementById("search");
const filterTypeSelectElement = document.getElementById("filter-type");


function applyFilters() {
    const queryRaw = searchInputElement ? searchInputElement.value : "";
    const queryNormalized = typeof queryRaw === "string" ? queryRaw.trim().toLowerCase() : "";

    const selectedType = filterTypeSelectElement ? filterTypeSelectElement.value : "all";


    let filteredList = announcements.slice();


    if (selectedType !== "all") {
        filteredList = filteredList.filter(function (item) {
            return item.type === selectedType;
        });
    }


    if (queryNormalized) {
        filteredList = filteredList.filter(function (item) {
            const tagsJoined = Array.isArray(item.tags) ? item.tags.join(" ") : "";
            const haystack = (item.title + " " + item.desc + " " + tagsJoined).toLowerCase();
            return haystack.includes(queryNormalized);
        });
    }


    filteredList.sort(function (a, b) {

        const aDate = new Date(a.date + "T00:00");
        const bDate = new Date(b.date + "T00:00");
        return bDate - aDate;
    });

    renderList(filteredList);
}


if (searchInputElement) {
    searchInputElement.addEventListener("input", applyFilters);
}
if (filterTypeSelectElement) {
    filterTypeSelectElement.addEventListener("change", applyFilters);
}





const newPostButton = document.getElementById("btn-new");
if (newPostButton) {
    newPostButton.addEventListener("click", function () {
        const postModalElement = document.getElementById("postModal");
        if (postModalElement) {
            const modalInstance = new bootstrap.Modal(postModalElement);
            modalInstance.show();
        }
    });
}


function handlePostSave(submitEvent) {
    if (submitEvent && typeof submitEvent.preventDefault === "function") {
        submitEvent.preventDefault();
    }

    const titleInput = document.getElementById("post-title");
    const typeSelect = document.getElementById("post-type");
    const dateInput = document.getElementById("post-date");
    const timeInput = document.getElementById("post-time");
    const descInput = document.getElementById("post-desc");
    const placeInput = document.getElementById('place-input');

    const titleValue = titleInput ? titleInput.value.trim() : "";
    if (!titleValue) {
        // alert("Add a title");
        showToast('Please add a title', 3000, "toastContainer", "red", "white");
        return;
    }

    const typeValue = typeSelect ? typeSelect.value : "social";
    const dateValue = dateInput && dateInput.value ? dateInput.value : new Date().toISOString().slice(0, 10);
    const timeValue = timeInput && timeInput.value ? timeInput.value : "NA";
    const descValue = descInput && descInput.value ? descInput.value : "";
    const placeValue = placeInput && placeInput.value ? placeInput.value : "NA";

    const newEvent = {
        id: Date.now() % 1000000,
        title: titleValue,
        type: typeValue,
        date: dateValue,
        time: timeValue,
        place: placeValue,
        desc: descValue,
        tags: [],
        rsvp: "#"
    };


    announcements.unshift(newEvent);
    updateAnnouncements();



    renderList(announcements);


    const postModalElement = document.getElementById("postModal");
    if (postModalElement) {
        const modalInstance = bootstrap.Modal.getInstance(postModalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }


    const postFormElement = document.getElementById("postForm");
    if (postFormElement && typeof postFormElement.reset === "function") {
        postFormElement.reset();
    }
}

async function updateAnnouncements() {
    const q = query(collection(db, "announcements"));
    const snap = await getDocs(q);
    const firstDoc = snap.docs[0];
    const ref = doc(db, "announcements", firstDoc.id);
    await updateDoc(
        ref,
        {
            announcements: announcements,
        }
    );
}


const postSaveButton = document.getElementById("postSave");
if (postSaveButton) {
    postSaveButton.addEventListener("click", handlePostSave);
}




document.addEventListener('click', function (event) {
    const btn = event.target.closest('.detailShowBtn');
    if (!btn) return;

    event.preventDefault();

    const idAttribute = btn.getAttribute('data-id');
    const eventId = idAttribute ? Number(idAttribute) : NaN;

    if (!Number.isFinite(eventId)) {
        return;
    }

    const eventData = announcements.find(function (item) {
        return item.id === eventId;
    });

    if (!eventData) {
        return;
    }

    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const modalPlace = document.getElementById("modalPlace");
    const modalExtras = document.getElementById("modalExtras");

    if (modalTitle) modalTitle.textContent = eventData.title;
    if (modalDesc) modalDesc.textContent = eventData.desc;
    if (modalDate) modalDate.textContent = formatDateToDisplay(eventData.date);
    if (modalTime) modalTime.textContent = eventData.time;
    if (modalPlace) modalPlace.textContent = eventData.place;

    if (modalExtras) {
        const tagsArray = Array.isArray(eventData.tags) ? eventData.tags : [];
        const tagsHtml = tagsArray
            .map(function (tag) {
                return `<span class="tag me-1">${tag}</span>`;
            })
            .join(" ");
        modalExtras.innerHTML = tagsHtml;
    }

    const eventModalElement = document.getElementById("eventModal");
    if (eventModalElement) {
        const modalInstance = new bootstrap.Modal(eventModalElement);
        modalInstance.show();
    }
});



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

        if (userData.role != "") {
            if (userData.role === "admin") {
                document.getElementById('btn-new').style.display = "inline";
            }
        }
        getEventJoinList();
        // setUserData();
        // updateEditInputs();
        // console.log("User data:", userData);
    } catch (err) {
        // console.error("Could not load user data:", err);
        userData = '';
    }
})();

document.addEventListener('click', async function (event) {
    const btn = event.target.closest('.join-event-btn');
    if (!btn) return;

    const eventTitle = btn.getAttribute('event-name');
    const eventId = btn.getAttribute('event-id');
    // console.log(btn.getAttribute('event-name'));
    // console.log(userData);

    if (window.confirm(`Are you sure you want to join the event "${eventTitle}"? Once joined, your data will be recorded.`) === true) {
        if (joinedEventIds.includes(eventId) === false) {
            console.log(true);

            const docRef = await addDoc(collection(db, "event-join-list"), {
                eventId: eventId,
                eventName: eventTitle,
                userName: userData.name,
                userEmail: userData.email
            });
        }
        alert("Data recorded!")
        getEventJoinList();
    }
});

function updateJoinEventBtns() {
    const joinEventCovers = document.getElementsByClassName('join-event-btn-cover');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < joinEventCovers.length; i++) {
        const cover = joinEventCovers[i];
        const btn = cover.querySelector('.join-event-btn');
        if (!btn) continue;

        const eventDateAttr = btn.getAttribute('event-date');
        if (eventDateAttr) {
            const eventDateObj = new Date(eventDateAttr + 'T00:00');
            eventDateObj.setHours(0, 0, 0, 0);
            if (eventDateObj < today) {
                btn.disabled = true;
                btn.innerHTML = 'Completed';
                
                cover.removeAttribute('data-bs-toggle');
                cover.removeAttribute('data-bs-title');
                continue;
            }
        }

        if (localStorage.getItem('isLoggedIn') === "false") {
            btn.disabled = true;
            cover.setAttribute("data-bs-custom-class", "custom-tooltip");
            cover.setAttribute("data-bs-toggle", "tooltip");
            cover.setAttribute("data-bs-title", "Login to join event");
        } else {
            // ensure tooltip attributes removed for logged in users
            cover.removeAttribute('data-bs-toggle');
            cover.removeAttribute('data-bs-title');
        }
    }

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
}



let joinedEventIds = [];
async function getEventJoinList() {
    joinedEventIds = [];
    // console.log(userData);

    const userQuery = query(collection(db, "event-join-list"), where("userEmail", "==", userData.email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
        return;
    }

    const doc = userSnapshot.docs[0];
    // console.log(data.courses);
    // console.log(data);
    userSnapshot.forEach(d => {
        const data = d.data();
        if (data && data.eventId) joinedEventIds.push(String(data.eventId));
    });
    // return data.courses;
    updateJoinEventBtnsBtns();
}


function updateJoinEventBtnsBtns() {
    const joinEvenetBtns = document.getElementsByClassName('join-event-btn');
    // console.log(joinEvenetBtns);

    for (let i = 0; i < joinEvenetBtns.length; i++) {
        if (joinedEventIds.includes(joinEvenetBtns[i].getAttribute("event-id")) === true) {
            // console.log(joinEvenetBtns[i]);
            // console.log(joinedEventIds);


            joinEvenetBtns[i].disabled = true;
            joinEvenetBtns[i].innerHTML = "Already joined!";
        }
    }
}