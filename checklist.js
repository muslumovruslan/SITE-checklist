const CHECKLIST_KEY = "SITE_CHECKLIST_STATE";

function initChecklist() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((i, idx) => {
    i.id ||= "f_" + idx;
    i.addEventListener("change", saveState);
    i.addEventListener("input", saveState);
  });
  loadState();
  updateProgress();
}

function saveState() {
  const inputs = document.querySelectorAll("input");
  const state = {};
  inputs.forEach(i => {
    state[i.id] = i.type === "checkbox" ? i.checked : i.value;
    if (i.type === "checkbox")
      i.parentElement.classList.toggle("completed", i.checked);
  });
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  updateProgress();
}

function loadState() {
  const state = JSON.parse(localStorage.getItem(CHECKLIST_KEY));
  if (!state) return;
  document.querySelectorAll("input").forEach(i => {
    if (i.id in state) {
      if (i.type === "checkbox") {
        i.checked = state[i.id];
        i.parentElement.classList.toggle("completed", i.checked);
      } else i.value = state[i.id];
    }
  });
}

function clearChecklist() {
  if (!confirm("This will clear the entire checklist. Continue?")) return;
  localStorage.removeItem(CHECKLIST_KEY);
  location.reload();
}

function updateProgress() {
  const boxes = document.querySelectorAll("input[type=checkbox]");
  const done = [...boxes].filter(b => b.checked).length;
  const pct = boxes.length ? Math.round(done / boxes.length * 100) : 0;
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent = pct + "% completed";
}

function exportPDF() {
  window.print();
}

function toggleNext(el) {
  const next = el.nextElementSibling;
  if (next)
    next.style.display = next.style.display === "block" ? "none" : "block";
}
