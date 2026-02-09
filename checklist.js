const firebaseConfig = {
  apiKey: "AIzaSyDU7HYzKUsDhG50tU6SwQdLGAfmKjAS7JY",
  authDomain: "shared-checklist-7a74d.firebaseapp.com",
  databaseURL: "https://shared-checklist-7a74d-default-rtdb.firebaseio.com",
  projectId: "shared-checklist-7a74d",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function initChecklist(mode = "external") {

  // hide sections/items not meant for this mode
  document.querySelectorAll("[data-for]").forEach(el => {
    const allowed = el.getAttribute("data-for");

    if (allowed !== "both" && allowed !== mode) {
      el.style.display = "none";

      // if header, also hide its content block
      if (el.tagName === "H2" || el.tagName === "H3") {
        const next = el.nextElementSibling;
        if (next) {
          next.style.display = "none";
        }
      }
    }
  });

  const inputs = document.querySelectorAll("input");
  inputs.forEach((i, idx) => {
    i.id ||= "f_" + idx;
    i.addEventListener("change", saveState);
    i.addEventListener("input", saveState);
  });

  updateProgress();
  setTimeout(loadState, 0);
}
function collectState() {
  const inputs = document.querySelectorAll("input");
  const state = {};

  inputs.forEach(i => {
    state[i.id] = i.type === "checkbox" ? i.checked : i.value;

    if (i.type === "checkbox") {
      i.parentElement.classList.toggle("completed", i.checked);
    }
  });

  return state;
}

function saveState() {
  const state = collectState();
  db.ref("checklist").set(state);
  updateProgress();
}

function applyState(state) {
  if (!state) return;

  document.querySelectorAll("input").forEach(i => {
    if (i.id in state) {
      if (i.type === "checkbox") {
        i.checked = state[i.id];
        i.parentElement.classList.toggle("completed", i.checked);
      } else {
        i.value = state[i.id];
      }
    }
  });

  updateProgress();
}

function loadState() {
  db.ref("checklist").on("value", snapshot => {
    applyState(snapshot.val());
  });
}


function clearChecklist() {
  if (!confirm("This will clear the entire checklist. Continue?")) return;
  db.ref("checklist").remove();
}


function updateProgress() {
  const boxes = [...document.querySelectorAll("input[type=checkbox]")]
    .filter(b => b.offsetParent !== null); // only visible checkboxes

  const done = boxes.filter(b => b.checked).length;
  const pct = boxes.length ? Math.round(done / boxes.length * 100) : 0;

  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent = pct + "% completed";
}

function exportPDF() {
  window.print();
}

function toggleNext(el) {
  const next = el.nextElementSibling;
  if (next) {
    next.style.display = next.style.display === "block" ? "none" : "block";
  }
}



