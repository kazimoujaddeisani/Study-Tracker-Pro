// =====================================
// Study Tracker Pro 3.0
// Firebase Team Progress Edition
// =====================================

const topicData = {
  bangla: banglaTopics,
  english: englishTopics,
  math: mathTopics,
  gk: gkTopics
};

window.topicData = topicData;

let completedTopics = JSON.parse(localStorage.getItem("completedTopics")) || [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
window.currentSubject = null;

function getActiveCompletedTopics() {
  if (Array.isArray(window.activeCompletedTopics)) return window.activeCompletedTopics;
  return completedTopics;
}

function syncCompletedTopics() {
  completedTopics = [...new Set(getActiveCompletedTopics())];
  window.activeCompletedTopics = completedTopics;
  localStorage.setItem("completedTopics", JSON.stringify(completedTopics));
}

function loadSubject(subject) {
  window.currentSubject = subject;
  const list = document.getElementById("topicList");
  const title = document.getElementById("subjectTitle");
  if (!list || !title || !topicData[subject]) return;

  const info = subjects.find(item => item.id === subject);
  title.innerHTML = info ? info.name : subject;
  list.innerHTML = "";
  const active = getActiveCompletedTopics();

  topicData[subject].forEach((topic, index) => {
    const id = subject + "-" + index;
    const checked = active.includes(id);
    const div = document.createElement("div");
    div.className = "topic-item";
    div.innerHTML = `
      <span class="topic-name ${checked ? "completed" : ""}">${index + 1}. ${topic}</span>
      <div>
        <input type="checkbox" class="topic-check" ${checked ? "checked" : ""} onclick="completeTopic('${subject}',${index})">
        <button onclick="addBookmark('${subject}',${index})">⭐</button>
      </div>`;
    list.appendChild(div);
  });
}

async function completeTopic(subject, index) {
  const id = subject + "-" + index;
  let active = [...getActiveCompletedTopics()];

  if (active.includes(id)) active = active.filter(item => item !== id);
  else active.push(id);

  completedTopics = [...new Set(active)];
  window.activeCompletedTopics = completedTopics;
  localStorage.setItem("completedTopics", JSON.stringify(completedTopics));
  updateProgress();
  loadSubject(subject);

  if (typeof window.saveOwnFirebaseProgress === "function" && window.getCurrentTeamUser?.()) {
    try { await window.saveOwnFirebaseProgress(); }
    catch (error) { console.error("Firebase progress save failed:", error); }
  }
}

window.completeTopic = completeTopic;
window.updateProgress = updateProgress;

function updateProgress() {
  const active = getActiveCompletedTopics();
  let total = 0;
  Object.values(topicData).forEach(item => total += item.length);
  const percent = total ? Math.round((active.length / total) * 100) : 0;
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("progressText");
  if (bar) bar.style.width = percent + "%";
  if (text) text.innerHTML = `Complete: ${active.length}/${total} (${percent}%)`;
}

function searchTopic() {
  const input = document.getElementById("searchInput")?.value.toLowerCase() || "";
  document.querySelectorAll(".topic-item").forEach(item => {
    item.style.display = item.innerText.toLowerCase().includes(input) ? "flex" : "none";
  });
}

function resetProgress() {
  if (!confirm("শুধু আপনার Progress Reset করবেন?")) return;
  completedTopics = [];
  window.activeCompletedTopics = [];
  localStorage.setItem("completedTopics", "[]");
  updateProgress();
  if (window.currentSubject) loadSubject(window.currentSubject);
  if (typeof window.saveOwnFirebaseProgress === "function" && window.getCurrentTeamUser?.()) {
    window.saveOwnFirebaseProgress().catch(error => console.error(error));
  }
}

function saveRoutine() {
  const checks = document.querySelectorAll(".routine-check");
  let complete = true;
  checks.forEach(check => { if (!check.checked) complete = false; });
  if (!complete) return;

  const today = new Date().toDateString();
  const last = localStorage.getItem("lastStudyDay");
  if (last !== today) {
    let streak = Number(localStorage.getItem("streak")) || 0;
    streak++;
    localStorage.setItem("streak", streak);
  }
  localStorage.setItem("lastStudyDay", today);
  updateStreak();
}

function updateStreak() {
  const streak = localStorage.getItem("streak") || 0;
  const box = document.getElementById("streakText");
  if (box) box.innerHTML = "🔥 Current Streak: " + streak + " দিন";
}

function saveTarget() {
  const value = document.getElementById("dailyTarget")?.value || "";
  localStorage.setItem("dailyTarget", value);
  updateTarget();
}

function updateTarget() {
  const target = localStorage.getItem("dailyTarget") || 0;
  const box = document.getElementById("targetStatus");
  if (box) box.innerHTML = "🎯 আজকের Target: " + target + " Topic";
}

function saveNote() {
  const note = document.getElementById("noteInput")?.value || "";
  localStorage.setItem("studyNote", note);
  const status = document.getElementById("noteStatus");
  if (status) status.innerHTML = "✅ Note Saved";
}

function loadNote() {
  const note = localStorage.getItem("studyNote");
  const box = document.getElementById("noteInput");
  if (note && box) box.value = note;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function loadDarkMode() {
  if (localStorage.getItem("darkMode") === "true") document.body.classList.add("dark");
}

function addBookmark(subject, index) {
  const id = subject + "-" + index;
  if (!bookmarks.includes(id)) {
    bookmarks.push(id);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }
  showBookmarks();
}

function showBookmarks() {
  const box = document.getElementById("bookmarkList");
  if (!box) return;
  if (bookmarks.length === 0) {
    box.innerHTML = "No Bookmark Added";
    return;
  }
  box.innerHTML = "";
  bookmarks.forEach(item => {
    const div = document.createElement("div");
    div.className = "topic-item";
    div.innerHTML = "⭐ " + item;
    box.appendChild(div);
  });
}

const mcqData = [
  { question: "বাংলা সাহিত্যের প্রাচীন নিদর্শন কোনটি?", options: ["চর্যাপদ", "গীতাঞ্জলি", "বিষাদ সিন্ধু", "কপালকুণ্ডলা"], answer: 0 },
  { question: "বাংলাদেশের জাতীয় কবি কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], answer: 1 }
];

let currentMCQ = 0;

function loadMCQ() {
  const q = mcqData[currentMCQ];
  const question = document.getElementById("mcqQuestion");
  const box = document.getElementById("mcqOptions");
  if (!question || !box) return;
  question.innerHTML = q.question;
  box.innerHTML = "";
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "mcq-option";
    btn.innerHTML = option;
    btn.onclick = function () {
      document.getElementById("mcqResult").innerHTML = index === q.answer ? "✅ Correct" : "❌ Wrong";
    };
    box.appendChild(btn);
  });
}

function nextMCQ() {
  currentMCQ++;
  if (currentMCQ >= mcqData.length) currentMCQ = 0;
  loadMCQ();
}

function examCountdown() {
  const exam = new Date("2026-12-31").getTime();
  const now = new Date().getTime();
  const days = Math.floor((exam - now) / (1000 * 60 * 60 * 24));
  const box = document.getElementById("countdown");
  if (box) box.innerHTML = "🔥 বাকি " + days + " দিন";
}

document.addEventListener("firebaseDataReady", () => {
  syncCompletedTopics();
  updateProgress();
  if (window.currentSubject) loadSubject(window.currentSubject);
});

window.onload = function () {
  updateProgress();
  updateStreak();
  updateTarget();
  loadNote();
  loadDarkMode();
  showBookmarks();
  loadMCQ();
  examCountdown();
};
