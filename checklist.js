/* ======================================================
   1. Dynamically load Firebase SDKs
====================================================== */

let db = null;
let checklistKey = "default";
let currentMode = "external"; // 🔑 IMPORTANT
let firebaseListenerAttached = false;

(function loadFirebase(cb) {
  const appScript = document.createElement("script");
  appScript.src =
    "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
  appScript.onload = () => {
    const dbScript = document.createElement("script");
    dbScript.src =
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
    dbScript.onload = cb;
    document.head.appendChild(dbScript);
  };
  document.head.appendChild(appScript);
})(initFirebase);

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyDU7HYzKUsDhG50tU6SwQdLGAfmKjAS7JY",
    authDomain: "shared-checklist-7a74d.firebaseapp.com",
    databaseURL:
      "https://shared-checklist-7a74d-default-rtdb.firebaseio.com",
    projectId: "shared-checklist-7a74d",
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  console.log("Firebase initialized");
}

/* ======================================================
   2. Checklist Initialization
====================================================== */

function initChecklist(mode = "external", key = null) {
  currentMode = mode;              // ✅ STORE MODE
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

  firebaseListenerAttached = false;
  waitForInputsThenInit();
}

/* ======================================================
   3. Robust DOM + Firebase Synchronization
====================================================== */

function waitForInputsThenInit() {
  const inputs = document.querySelectorAll("input");

  if (inputs.length === 0) {
    requestAnimationFrame(waitForInputsThenInit);
    return;
  }

  inputs.forEach(input => {
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
  if (firebaseListenerAttached) return;
  firebaseListenerAttached = true;

  checklistRef().on("value", snapshot => {
    applyState(snapshot.val());
  });
}

function applyState(state) {
  if (!state) {
    requestAnimationFrame(updateProgress);
    return;
  }

  document.querySelectorAll("input").forEach(input => {
    if (input.id in state) {
      if (input.type === "checkbox") {
        input.checked = state[input.id];
        input.parentElement.classList.toggle(
          "completed",
          input.checked
        );
      } else {
        input.value = state[input.id];
      }
    }
  });

  // 🔑 CRITICAL: update AFTER DOM updates
  requestAnimationFrame(updateProgress);
}

/* ======================================================
   6. Utilities
====================================================== */

function clearChecklist() {
  if (!confirm("This will clear the entire checklist. Continue?")) return;

  checklistRef().remove();

  document.querySelectorAll("input").forEach(input => {
    if (input.type === "checkbox") {
      input.checked = false;
      input.parentElement.classList.remove("completed");
    } else {
      input.value = "";
    }
  });

  updateProgress();
}

function updateProgress() {
  const boxes = [...document.querySelectorAll("input[type=checkbox]")];

  const relevantBoxes = boxes.filter(box => {
    const scope = box.closest("[data-for]");
    if (!scope) return true;

    const allowed = scope.getAttribute("data-for");
    return allowed === "both" || allowed === currentMode;
  });

  const done = relevantBoxes.filter(b => b.checked).length;
  const pct = relevantBoxes.length
    ? Math.round((done / relevantBoxes.length) * 100)
    : 0;

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
    next.style.display =
      next.style.display === "block" ? "none" : "block";
  }
}
