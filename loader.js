const SPEAKER_KEY = "SITE_SPEAKER_TYPE";

document.addEventListener("DOMContentLoaded", init);

function init() {
  const type = localStorage.getItem(SPEAKER_KEY);
  if (!type) loadPage("speakerPrompt");
  else if (type === "yes") loadPage("adaPage");
  else loadPage("externalPage", initChecklist);
}

function loadPage(page, callback) {
  fetch(`${page}.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById("app").innerHTML = html;
      if (callback) callback();
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
