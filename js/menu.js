// Toggle mobile menu
function myFunction() {
  const nav = document.getElementById("myTopnav");
  nav.classList.toggle("responsive");

  // Close any open dropdowns when collapsing
  if (!nav.classList.contains("responsive")) {
    document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
  }
}

// Toggle dropdown on mobile
function toggleDropdown(event) {
  if (window.innerWidth <= 650) {
    event.preventDefault();
    event.stopPropagation();
    const dropdownContent = event.target.nextElementSibling;
    const open = dropdownContent.classList.contains('show');

    // Close other dropdowns
    document.querySelectorAll('.topnav.responsive .dropdown-content.show')
      .forEach(el => el.classList.remove('show'));

    if (!open) {
      dropdownContent.classList.add('show');
    }
  }
}

// Close nav when clicking links on mobile
document.addEventListener('click', (e) => {
  const nav = document.getElementById("myTopnav");
  if (window.innerWidth <= 650 && nav.classList.contains('responsive')) {
    const isLink = e.target.tagName === 'A' && !e.target.classList.contains('dropbtn');
    if (isLink) {
      nav.classList.remove('responsive');
      document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
    }
  }
});
