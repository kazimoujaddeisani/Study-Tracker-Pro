import { ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const TEAM_USERS = {
  sani: { name: "Sani", pin: "2001" },
  sajin: { name: "Sajin", pin: "2005" },
  rifa: { name: "Rifa", pin: "2003" }
};

let db = null;
let currentUser = null;
let firebaseCompletedTopics = [];
let teamProgress = {};

function getDB() {
  return window.firebaseDatabase || null;
}

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

async function findUser(name, pin) {
  const wanted = normalizeUserKey(name);
  const wantedPin = String(pin || "").trim();
  db = getDB();

  if (!db) throw new Error("Firebase database is not ready.");

  try {
    const snap = await get(ref(db, "users"));
    const data = snap.val() || {};

    for (const [key, value] of Object.entries(data)) {
      if (!value || typeof value !== "object") continue;
      const dbName = normalizeUserKey(value.name || value.username || value.user || key);
      const dbPin = String(value.pin ?? value.PIN ?? value.password ?? "").trim();
      if (dbName === wanted && dbPin === wantedPin) {
        return { id: normalizeUserKey(key) || wanted, name: value.name || name };
      }
    }
  } catch (error) {
    console.warn("Could not read users node, using built-in team profiles.", error);
  }

  const fallback = TEAM_USERS[wanted];
  if (fallback && fallback.pin === wantedPin) {
    return { id: wanted, name: fallback.name };
  }

  return null;
}

async function loadOwnProgress() {
  if (!currentUser || !db) return;

  const snap = await get(ref(db, `progress/${currentUser.id}`));
  const data = snap.val() || {};
  const remote = Array.isArray(data.completedTopics) ? data.completedTopics : [];

  firebaseCompletedTopics = [...new Set(remote)];
  window.activeCompletedTopics = firebaseCompletedTopics.slice();

  localStorage.setItem("completedTopics", JSON.stringify(firebaseCompletedTopics));
  document.dispatchEvent(new CustomEvent("firebaseDataReady"));
}

async function saveOwnProgress() {
  if (!currentUser || !db) return;
  firebaseCompletedTopics = Array.isArray(window.activeCompletedTopics)
    ? [...new Set(window.activeCompletedTopics)]
    : [];

  await set(ref(db, `progress/${currentUser.id}`), {
    completedTopics: firebaseCompletedTopics,
    updatedAt: Date.now()
  });
}

function listenTeamProgress() {
  if (!db) return;

  onValue(ref(db, "progress"), snapshot => {
    teamProgress = snapshot.val() || {};
    renderTeamProgress();
  }, error => {
    console.error("Team progress listener error:", error);
  });
}

function getTotalTopics() {
  if (window.topicData) {
    return Object.values(window.topicData).reduce((sum, list) => sum + list.length, 0);
  }
  return 428;
}

function getCount(id) {
  const data = teamProgress[id] || {};
  return Array.isArray(data.completedTopics) ? data.completedTopics.length : 0;
}

function renderTeamProgress() {
  const box = document.getElementById("teamProgressList");
  if (!box) return;

  const total = getTotalTopics();
  const order = ["sani", "sajin", "rifa"];

  box.innerHTML = order.map(id => {
    const user = TEAM_USERS[id];
    const count = getCount(id);
    const percent = total ? Math.round((count / total) * 100) : 0;
    const isMe = currentUser && currentUser.id === id;

    return `
      <div class="team-user-card ${isMe ? "team-me" : ""}">
        <div class="team-user-top">
          <strong>${user.name}${isMe ? " (You)" : ""}</strong>
          <span>${count}/${total} (${percent}%)</span>
        </div>
        <div class="team-progress-track">
          <div class="team-progress-fill" style="width:${percent}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

window.getCurrentTeamUser = () => currentUser;
window.getFirebaseCompletedTopics = () => firebaseCompletedTopics.slice();
window.saveOwnFirebaseProgress = saveOwnProgress;
window.renderTeamProgress = renderTeamProgress;

window.teamLogin = async function () {
  const nameInput = document.getElementById("loginName");
  const pinInput = document.getElementById("loginPin");
  const status = document.getElementById("loginStatus");
  const loginBox = document.getElementById("loginBox");
  const appContent = document.getElementById("appContent");

  const name = nameInput.value.trim();
  const pin = pinInput.value.trim();

  if (!name || !pin) {
    status.textContent = "নাম এবং PIN দিন।";
    return;
  }

  status.textContent = "Login হচ্ছে...";

  try {
    const user = await findUser(name, pin);
    if (!user) {
      status.textContent = "নাম বা PIN ভুল।";
      return;
    }

    currentUser = user;
    localStorage.setItem("teamUser", JSON.stringify(user));

    await loadOwnProgress();
    listenTeamProgress();

    document.getElementById("currentUserName").textContent = user.name;
    loginBox.style.display = "none";
    appContent.style.display = "block";
    status.textContent = "";

    if (typeof window.updateProgress === "function") window.updateProgress();
    if (typeof window.loadSubject === "function" && window.currentSubject) {
      window.loadSubject(window.currentSubject);
    }
    renderTeamProgress();
  } catch (error) {
    console.error(error);
    status.textContent = "Firebase connection সমস্যা। আবার চেষ্টা করুন।";
  }
};

window.teamLogout = function () {
  currentUser = null;
  firebaseCompletedTopics = [];
  window.activeCompletedTopics = [];
  localStorage.removeItem("teamUser");
  location.reload();
};

window.showTeamProgress = function () {
  const section = document.getElementById("teamProgressSection");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  renderTeamProgress();
};

document.addEventListener("DOMContentLoaded", async () => {
  db = getDB();
  renderTeamProgress();

  const saved = JSON.parse(localStorage.getItem("teamUser") || "null");
  if (saved && saved.id) {
    const profile = TEAM_USERS[saved.id];
    if (profile) {
      document.getElementById("loginName").value = profile.name;
      document.getElementById("loginPin").value = profile.pin;
    }
  }
});
