export function showToast(message, duration = 3000, toastContainerId = 'toastContainer', bgColor, color) {
    const toastContainer = document.getElementById(toastContainerId);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.backgroundColor = bgColor;
    toast.style.color = color;
    toast.style.padding = "10px";
    toast.style.borderRadius = "1.5rem";
    toast.style.margin = "10px";
    toast.innerText = message;

    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100); // Slight delay to allow for CSS transition

    // Hide and remove the toast after the specified duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300); // Wait for CSS transition to finish
    }, duration);
}