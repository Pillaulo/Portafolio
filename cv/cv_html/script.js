const languageButtons = document.querySelectorAll("[data-language]");
const resumes = document.querySelectorAll("[data-resume]");
const printButton = document.querySelector("#print-cv");

function setLanguage(language) {
  document.documentElement.lang = language;

  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  resumes.forEach((resume) => {
    resume.classList.toggle("is-active", resume.dataset.resume === language);
  });

  printButton.textContent = language === "es" ? "Guardar como PDF" : "Save as PDF";
  localStorage.setItem("cv-language", language);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

printButton.addEventListener("click", () => window.print());

const savedLanguage = localStorage.getItem("cv-language");
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
const browserLanguage = navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
const initialLanguage =
  requestedLanguage === "es" || requestedLanguage === "en"
    ? requestedLanguage
    : savedLanguage === "es" || savedLanguage === "en"
      ? savedLanguage
      : browserLanguage;

setLanguage(initialLanguage);
