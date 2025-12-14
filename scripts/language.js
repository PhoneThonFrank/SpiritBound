const customLanguageSelector = document.getElementById("custom-language-selector");


const saved = localStorage.getItem("language") || "en";
customLanguageSelector.value = saved;


function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
    );
   
    const fixBodyTop = () => (document.body.style.top = "0px");
    fixBodyTop();
    setTimeout(fixBodyTop, 300);
    setTimeout(fixBodyTop, 1000);
    window.addEventListener("resize", fixBodyTop);
}


function setWidgetLanguage(value) {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo) return false; 
    combo.value = value;
    combo.dispatchEvent(new Event("change"));
    return true;
}


function applyLanguage(value) {
    localStorage.setItem("language", value);
    let tries = 0;
    const maxTries = 50;
    const intervalMs = 200;

    const tick = () => {
        if (setWidgetLanguage(value)) return;
        if (++tries >= maxTries) return;
        setTimeout(tick, intervalMs);
    };
    tick();
}

customLanguageSelector.addEventListener("change", (e) => {
    applyLanguage(e.target.value);
});

window.addEventListener("load", () => {
    applyLanguage(customLanguageSelector.value);
});
