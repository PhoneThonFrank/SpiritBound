document.addEventListener('DOMContentLoaded', () => {
  const stickyActionButton = document.getElementById('stickyActionButton');
  const fabIcon = document.getElementById('fabIcon');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const fabItems = document.querySelectorAll('.fab-item');
  const mainContainer = document.querySelector('.main-container');
  const SCROLL_THRESHOLD = 400;
  let isFabOpen = false;

  if (!mainContainer) {
    console.warn('Missing .main-container. Scroll-to-top will default to window.');
  }

  function toggleFabMenu() {
    isFabOpen = !isFabOpen;
    if (fabIcon) {
      fabIcon.classList.toggle('bi-list');
      fabIcon.classList.toggle('bi-x-lg');
    }
    fabItems.forEach(item => {
      item.classList.toggle('open', isFabOpen);
    });
  }

  if (stickyActionButton) {
    stickyActionButton.addEventListener('click', toggleFabMenu);
  }

  const onScroll = () => {
    const scrollY = mainContainer ? mainContainer.scrollTop : (window.scrollY || document.documentElement.scrollTop);
    const isScrolled = scrollY > SCROLL_THRESHOLD;
    if (scrollToTopBtn) {

      scrollToTopBtn.classList.toggle('scrolled-only', isScrolled);
    }
  };

  if (mainContainer) {
    mainContainer.addEventListener('scroll', onScroll, { passive: true });
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  const scrollToTop = () => {
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', scrollToTop);
  }

  onScroll();
});
