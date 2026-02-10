const SPEAKER_KEY = "SITE_SPEAKER_TYPE";
const CHECKLIST_KEY = "site-talk-2026"; // 🔒 STABLE EVENT KEY

document.addEventListener("DOMContentLoaded", init);

function init() {
  const type = localStorage.getItem(SPEAKER_KEY);

  if (!type) {
    loadPage("speakerPrompt");
  } else if (type === "yes") {
    loadPage("externalPage", () => {
      initChecklist("ada", CHECKLIST_KEY);
    });
  } else {
    loadPage("externalPage", () => {
      initChecklist("external", CHECKLIST_KEY);
    });
  }
}

function loadPage(page, callback) {
  fetch(`${page}.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById("app").innerHTML = html;

      // Ensure DOM is ready before checklist binds
      requestAnimationFrame(() => {
        if (callback) callback();
      });
    });
}

function confirmSpeakerType() {
  const s = document.querySelector('input[name="speakerType"]:checked');
  if (!s) return alert("Please select an option.");
  localStorage.setItem(SPEAKER_KEY, s.value);
  init();
}

function resetSpeakerType() {
  localStorage.removeItem(SPEAKER_KEY);
  init();
}
