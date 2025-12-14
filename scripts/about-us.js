const detailModal = document.getElementById('detailModal');
const detailModalBs = new bootstrap.Modal(document.getElementById('detailModal'));
const contactModal = new bootstrap.Modal(document.getElementById('contactUsModal'));

let profileName;
detailModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;

    profileName = button.getAttribute('data-name');

    const name = button.getAttribute('data-name');
    const role = button.getAttribute('data-role');
    const image = button.getAttribute('data-image');
    const bio = button.getAttribute('data-bio');

    const modalName = detailModal.querySelector('#modalProfileName');
    const modalRole = detailModal.querySelector('#modalProfileRole');
    const modalImage = detailModal.querySelector('#modalProfileImage');
    const modalBio = detailModal.querySelector('#modalProfileBio');

    modalName.textContent = name;
    modalRole.textContent = role;
    modalImage.src = image;
    modalBio.textContent = bio;

    if (profileName == "Phone Thon Hlayn") {
        document.getElementById('socialIconsCon').innerHTML = `
         <a href="https://www.facebook.com/profile.php?id=100074084199546" class="social-link"><i class="bi bi-facebook"></i></a>
        `;
    }
    else if (profileName == "Lu Khant Min") {
        document.getElementById('socialIconsCon').innerHTML = `
         <a href="https://www.facebook.com/lu.khant.min" class="social-link"><i class="bi bi-facebook"></i></a>
        <a href="https://www.discordapp.com/users/1214626216208764968" class="social-link"><i class="bi bi-discord"></i></a>
        `;
    }
    else if (profileName == "Arkar Moe Myint") {
        document.getElementById('socialIconsCon').innerHTML = `
        <a href="https://www.discordapp.com/users/1024710332201050142" class="social-link"><i class="bi bi-discord"></i></a>
        `;
    }
    else {
        document.getElementById('socialIconsCon').innerHTML = `
        <a href="https://www.discordapp.com/users/1260151976650477641" class="social-link"><i class="bi bi-discord"></i></a>
        `;
    }
});

function openDirectMesageContact(name) {
    detailModalBs.hide();
    contactModal.show();
    document.getElementById('contactSubject').value = `Direct Message: ${profileName}`;
}