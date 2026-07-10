const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');
const navLinks = navMenu.querySelectorAll('a');
const currentYear = document.getElementById('currentYear');

currentYear.textContent = new Date().getFullYear();

menuButton.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 680) {
    navMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});
