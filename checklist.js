/* ======================================================
   1. Dynamically load Firebase SDKs
====================================================== */

let db = null;
let checklistKey = "default"; // UNIQUE KEY PER CHECKLIST

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
  console.log("Firebase loaded");
}

/* ======================================================
   2. Checklist Initialization
====================================================== */

function initChecklist(mode = "external", key = null) {

  // Assign stable checklist key
  checklistKey = key || mode;

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

  // Attach listeners (NO auto-generated IDs)
  document.querySelectorAll("input").forEach(input => {
    if (!input.id) {
      console.warn("Input missing id:", input);
      return;
    }
    input.addEventListener("change", saveState);
    input.addEventListener("input", saveState);
  });

  updateProgress();
  waitForFirebaseThenLoad();
}

/* ======================================================
   3. Firebase Safe Loader
====================================================== */

function waitForFirebaseThenLoad() {
  if (!db) {
    requestAnimationFrame(waitForFirebaseThenLoad);
    return;
  }
  loadState();
}

/* ======================================================
   4. Firebase References
====================================================== */

function checklistRef() {
  return db.ref("checklists/" + checklistKey);
}

/* ======================================================
   5. State Management
====================================================== */

function collectState() {
  const state = {};
  document.querySelectorAll("input").forEach(input => {
    state[input.id] =
      input.type === "checkbox" ? input.checked : input.value;

    if (input.type === "checkbox") {
      input.parentElement.classList.toggle("completed", input.checked);
    }
  });
  return state;
}

function saveState() {
  if (!db) return;
  checklistRef().update(collectState());
  updateProgress();
}

function loadState() {
  checklistRef().on("value", snapshot => {
    applyState(snapshot.val());
  });
}

function applyState(state) {
  if (!state) return;

  document.querySelectorAll("input").forEach(input => {
    if (input.id in state) {
      if (input.type === "checkbox") {
        input.checked = state[input.id];
        input.parentElement.classList.toggle("completed", input.checked);
      } else {
        input.value = state[input.id];
      }
    }
  });

  updateProgress();
}

/* ======================================================
   6. Utilities
====================================================== */

function clearChecklist() {
  if (!confirm("This will clear the entire checklist. Continue?")) return;
  checklistRef().remove();
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
