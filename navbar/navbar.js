// window.location.href = '../index.html';

document.addEventListener('DOMContentLoaded', function () {
    const glassContainer = document.getElementById('glassContainer');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const backgroundVideo = document.getElementById('backgroundVideo');
    const imageFallback = document.querySelector('.image-fallback');


    backgroundVideo.addEventListener('error', function () {
        imageFallback.style.display = 'block';
        backgroundVideo.style.display = 'none';
    });

    const playPromise = backgroundVideo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            imageFallback.style.display = 'block';
            backgroundVideo.style.display = 'none';
        });
    }

    showRegisterBtn.addEventListener('click', function () {
        glassContainer.classList.add('right-panel-active');
    });
    showLoginBtn.addEventListener('click', function () {
        glassContainer.classList.remove('right-panel-active');
    });
    document.getElementById('registerText').addEventListener('click', function () {
        glassContainer.classList.add('right-panel-active');
    });
    document.getElementById('signInText').addEventListener('click', function () {
        glassContainer.classList.remove('right-panel-active');
    });
});

// const modal = new bootstrap.Modal(document.getElementById("contactUsModal"));
// modal.show();

document.addEventListener('DOMContentLoaded', () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el))
})