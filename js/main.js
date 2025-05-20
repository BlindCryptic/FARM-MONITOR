function showSection(id) {
  const sections = ["landing-page", "login-section", "register-section", "dashboard"];
  sections.forEach(sectionId => {
    const el = document.getElementById(sectionId);
    if (el) el.style.display = "none";
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = "flex";
  } else {
    console.warn(`Section "${id}" not found in DOM.`);
  }
}

// Button listeners with null checks
const getStartedBtn = document.getElementById("hero-get-started");
if (getStartedBtn) {
  getStartedBtn.onclick = () => showSection("login-section");
}

const showLoginBtn = document.getElementById("show-login-btn");
if (showLoginBtn) {
  showLoginBtn.onclick = () => showSection("login-section");
}

const showRegisterBtn = document.getElementById("show-register-btn");
if (showRegisterBtn) {
  showRegisterBtn.onclick = () => showSection("register-section");
}
