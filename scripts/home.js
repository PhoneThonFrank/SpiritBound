function showYtVid() {
    const iframe = `
    
                        <iframe
                        style="max-width: 560px; width: 100%; border-radius: 1.5rem; backdrop-filter: blur(10px); border: 1px solid rgba(128, 128, 128, 0.256);"
                        class="p-3" height="315"
                        src="https://www.youtube.com/embed/U_NSrO0BbjM?si=TEZgWsL4pb5-4Tw6&autoplay=1&playsinline=1"
                        title="YouTube video player" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`

    document.getElementById('ytModalCon').innerHTML = iframe;
}