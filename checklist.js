/* ======================================================
   1. Dynamically load Firebase SDKs (NO index.html dependency)
====================================================== */

let db = null;

(function loadFirebase(cb) {
  const appScript = document.createElement("script");
  appScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
  appScript.onload = () => {
    const dbScript = document.createElement("script");
    dbScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
    dbScript.onload = cb;
    document.head.appendChild(dbScript);
  };
  document.head.appendChild(appScript);
})(initFirebase);

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyDU7HYzKUsDhG50tU6SwQdLGAfmKjAS7JY",
    authDomain: "shared-checklist-7a74d.firebaseapp.com",
    databaseURL: "https://shared-checklist-7a74d-default-rtdb.firebaseio.com",
    projectId: "shared-checklist-7a74d",
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  console.log("Firebase loaded successfully");
}

/* ======================================================
   2. Checklist initialization
====================================================== */

function initChecklist(mode = "external") {

  // Hide sections not meant for this mode
  document.querySelectorAll("[data-for]").forEach(el => {
    const allowed = el.getAttribute("data-for");
    if (allowed !== "both" && allowed !== mode) {
      el.style.display = "none";
      if (el.tagName === "H2" || el.tagName === "H3") {
        const next = el.nextElementSibling;
        if (next) next.style.display = "none";
      }
    }
  });

  // Assign IDs and listeners
  const inputs = document.querySelectorAll("input");
  inputs.forEach((i, idx) => {
    i.id ||= "f_" + idx;
    i.addEventListener("change", saveState);
    i.addEventListener("input", saveState);
  });

  updateProgress();
  waitForFirebaseThenLoad();
}

/* ======================================================
   3. Firebase-safe loading
====================================================== */

function waitForFirebaseThenLoad() {
  if (!db) {
    requestAnimationFrame(waitForFirebaseThenLoad);
    return;
  }
  loadState();
}

/* ======================================================
   4. State management
====================================================== */

function collectState() {
  const state = {};
  document.querySelectorAll("input").forEach(i => {
    state[i.id] = i.type === "checkbox" ? i.checked : i.value;
    if (i.type === "checkbox") {
      i.parentElement.classList.toggle("completed", i.checked);
    }
  });
  return state;
}

function saveState() {
  if (!db) return;
  const state = collectState();
  db.ref("checklist").set(state);
  updateProgress();
}

function loadState() {
  db.ref("checklist").on("value", snapshot => {
    applyState(snapshot.val());
  });
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

/* ======================================================
   5. Utilities
====================================================== */

function clearChecklist() {
  if (!confirm("This will clear the entire checklist. Continue?")) return;
  if (db) db.ref("checklist").remove();
}

function updateProgress() {
  const boxes = [...document.querySelectorAll("input[type=checkbox]")]
    .filter(b => b.offsetParent !== null);

  const done = boxes.filter(b => b.checked).length;
  const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;

  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");

  if (fill) fill.style.width = pct + "%";
  if (text) text.textContent = pct + "% completed";
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
