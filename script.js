// =====================================
// Study Tracker Pro 3.0
// Firebase Team Progress Edition
// =====================================

const topicData = { bangla: banglaTopics, english: englishTopics, math: mathTopics, gk: gkTopics };
window.topicData = topicData;
let completedTopics = JSON.parse(localStorage.getItem("completedTopics")) || [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
window.currentSubject = null;

function getActiveCompletedTopics(){ if(Array.isArray(window.activeCompletedTopics)) return window.activeCompletedTopics; return completedTopics; }
function syncCompletedTopics(){ completedTopics=[...new Set(getActiveCompletedTopics())]; window.activeCompletedTopics=completedTopics; localStorage.setItem("completedTopics",JSON.stringify(completedTopics)); }

function loadSubject(subject){
 window.currentSubject=subject; const list=document.getElementById("topicList"), title=document.getElementById("subjectTitle"); if(!list||!title||!topicData[subject])return;
 const info=subjects.find(item=>item.id===subject); title.innerHTML=info?info.name:subject; list.innerHTML=""; const active=getActiveCompletedTopics();
 topicData[subject].forEach((topic,index)=>{ const id=subject+"-"+index,checked=active.includes(id),div=document.createElement("div"); div.className="topic-item"; div.innerHTML=`<span class="topic-name ${checked?"completed":""}">${index+1}. ${topic}</span><div><input type="checkbox" class="topic-check" ${checked?"checked":""} onclick="completeTopic('${subject}',${index})"><button onclick="addBookmark('${subject}',${index})">⭐</button></div>`; list.appendChild(div); });
}
async function completeTopic(subject,index){ const id=subject+"-"+index; let active=[...getActiveCompletedTopics()]; if(active.includes(id))active=active.filter(item=>item!==id);else active.push(id); completedTopics=[...new Set(active)];window.activeCompletedTopics=completedTopics;localStorage.setItem("completedTopics",JSON.stringify(completedTopics));updateProgress();loadSubject(subject);if(typeof window.saveOwnFirebaseProgress==="function"&&window.getCurrentTeamUser?.()){try{await window.saveOwnFirebaseProgress();}catch(e){console.error(e);}} }
window.completeTopic=completeTopic; window.updateProgress=updateProgress;
function updateProgress(){ const active=getActiveCompletedTopics();let total=0;Object.values(topicData).forEach(item=>total+=item.length);const percent=total?Math.round(active.length/total*100):0;const bar=document.getElementById("progressBar"),text=document.getElementById("progressText");if(bar)bar.style.width=percent+"%";if(text)text.innerHTML=`Complete: ${active.length}/${total} (${percent}%)`; }
function searchTopic(){const input=document.getElementById("searchInput")?.value.toLowerCase()||"";document.querySelectorAll(".topic-item").forEach(item=>item.style.display=item.innerText.toLowerCase().includes(input)?"flex":"none");}
function resetProgress(){if(!confirm("শুধু আপনার Progress Reset করবেন?"))return;completedTopics=[];window.activeCompletedTopics=[];localStorage.setItem("completedTopics","[]");updateProgress();if(window.currentSubject)loadSubject(window.currentSubject);if(typeof window.saveOwnFirebaseProgress==="function"&&window.getCurrentTeamUser?.())window.saveOwnFirebaseProgress().catch(console.error);}
function saveRoutine(){const checks=document.querySelectorAll(".routine-check");let complete=true;checks.forEach(c=>{if(!c.checked)complete=false});if(!complete)return;const today=new Date().toDateString(),last=localStorage.getItem("lastStudyDay");if(last!==today){let streak=Number(localStorage.getItem("streak"))||0;streak++;localStorage.setItem("streak",streak);}localStorage.setItem("lastStudyDay",today);updateStreak();}
function updateStreak(){const streak=localStorage.getItem("streak")||0,box=document.getElementById("streakText");if(box)box.innerHTML="🔥 Current Streak: "+streak+" দিন";}
function saveTarget(){const value=document.getElementById("dailyTarget")?.value||"";localStorage.setItem("dailyTarget",value);updateTarget();}
function updateTarget(){const target=localStorage.getItem("dailyTarget")||0,box=document.getElementById("targetStatus");if(box)box.innerHTML="🎯 আজকের Target: "+target+" Topic";}
function saveNote(){const note=document.getElementById("noteInput")?.value||"";localStorage.setItem("studyNote",note);const status=document.getElementById("noteStatus");if(status)status.innerHTML="✅ Note Saved";}
function loadNote(){const note=localStorage.getItem("studyNote"),box=document.getElementById("noteInput");if(note&&box)box.value=note;}
function toggleDarkMode(){document.body.classList.toggle("dark");localStorage.setItem("darkMode",document.body.classList.contains("dark"));}
function loadDarkMode(){if(localStorage.getItem("darkMode")==="true")document.body.classList.add("dark");}
function addBookmark(subject,index){const id=subject+"-"+index;if(!bookmarks.includes(id)){bookmarks.push(id);localStorage.setItem("bookmarks",JSON.stringify(bookmarks));}showBookmarks();}
function showBookmarks(){const box=document.getElementById("bookmarkList");if(!box)return;if(!bookmarks.length){box.innerHTML="No Bookmark Added";return;}box.innerHTML="";bookmarks.forEach(item=>{const div=document.createElement("div");div.className="topic-item";div.innerHTML="⭐ "+item;box.appendChild(div);});}

const mcqData=[{question:"বাংলা সাহিত্যের প্রাচীন নিদর্শন কোনটি?",options:["চর্যাপদ","গীতাঞ্জলি","বিষাদ সিন্ধু","কপালকুণ্ডলা"],answer:0},{question:"বাংলাদেশের জাতীয় কবি কে?",options:["রবীন্দ্রনাথ ঠাকুর","কাজী নজরুল ইসলাম","জীবনানন্দ দাশ","সুকান্ত ভট্টাচার্য"],answer:1}];
let currentMCQ=0;
function loadMCQ(){const q=mcqData[currentMCQ],question=document.getElementById("mcqQuestion"),box=document.getElementById("mcqOptions");if(!question||!box)return;question.innerHTML=q.question;box.innerHTML="";q.options.forEach((option,index)=>{const btn=document.createElement("button");btn.className="mcq-option";btn.innerHTML=option;btn.onclick=()=>document.getElementById("mcqResult").innerHTML=index===q.answer?"✅ Correct":"❌ Wrong";box.appendChild(btn);});}
function nextMCQ(){currentMCQ++;if(currentMCQ>=mcqData.length)currentMCQ=0;loadMCQ();}
function examCountdown(){const exam=new Date("2026-12-31").getTime(),days=Math.floor((exam-Date.now())/86400000),box=document.getElementById("countdown");if(box)box.innerHTML="🔥 বাকি "+days+" দিন";}

// 180-day study plan: practical daily rotation using the existing four subjects.
const planSubjects=[
 {key:"bangla",name:"📖 বাংলা",focus:"নতুন topic + 20 MCQ"},
 {key:"english",name:"🇬🇧 English",focus:"নতুন topic + 20 MCQ"},
 {key:"math",name:"➗ Mathematics",focus:"নতুন topic + 15 practice"},
 {key:"gk",name:"🌍 General Knowledge",focus:"নতুন topic + 20 MCQ"}
];
function build180Plan(){
 const plan=[];for(let day=1;day<=180;day++){
  const phase=day<=120?"মূল পড়া":day<=150?"১ম পূর্ণ Revision":"Final Revision + Mock Test";
  let tasks;
  if(day<=120){
   const a=planSubjects[(day-1)%4],b=planSubjects[day%4],c=planSubjects[(day+1)%4],d=planSubjects[(day+2)%4];
   tasks=[`${a.name} • ${a.focus}`,`${b.name} • ${b.focus}`,`${c.name} • ${c.focus}`,`${d.name} • ${d.focus}`,"🔄 আগের দিনের 30 মিনিট Revision","📝 রাতে 50 MCQ"];
  }else if(day<=150){
   tasks=["📖 বাংলা • Revision","🇬🇧 English • Revision","➗ Math • Practice","🌍 GK • Revision","📝 ভুল MCQ Revision","🧪 75–100 MCQ Test"];
  }else{
   tasks=["🔄 দুর্বল বাংলা/English topic Revision","🔄 Math formula + problem practice","🔄 GK rapid revision","📝 Previous Question Practice","🧪 Full Mock Test","📌 ভুল প্রশ্নের Final Revision"];
  }
  plan.push({day,phase,tasks});
 }
 return plan;
}
const studyPlan180=build180Plan();
function currentPlanDay(){return Math.min(180,Math.max(1,Number(localStorage.getItem("studyPlanDay"))||1));}
function renderPlan180(){
 const day=currentPlanDay(),item=studyPlan180[day-1],dayBox=document.getElementById("planDay"),dateBox=document.getElementById("planDate"),tasksBox=document.getElementById("planTasks"),progressBox=document.getElementById("planProgress");
 if(!item||!tasksBox)return;
 if(dayBox)dayBox.innerHTML=`Day ${day} / 180 • ${item.phase}`;
 if(dateBox){const start=localStorage.getItem("studyPlanStart")||new Date().toISOString().slice(0,10);if(!localStorage.getItem("studyPlanStart"))localStorage.setItem("studyPlanStart",start);const dt=new Date(start+"T00:00:00");dt.setDate(dt.getDate()+day-1);dateBox.innerHTML="📅 "+dt.toLocaleDateString("en-GB");}
 tasksBox.innerHTML=item.tasks.map((t,i)=>`<label style="display:block;padding:8px 0"><input type="checkbox" class="plan-check" data-day="${day}" data-index="${i}"> ${t}</label>`).join("");
 const saved=JSON.parse(localStorage.getItem("planChecks")||"{}");(saved[day]||[]).forEach(i=>{const el=tasksBox.querySelector(`[data-index="${i}"]`);if(el)el.checked=true;});
 tasksBox.querySelectorAll("input").forEach(el=>el.addEventListener("change",savePlanChecks));
 const done=JSON.parse(localStorage.getItem("completedPlanDays")||"[]");if(progressBox)progressBox.innerHTML=`📊 Plan Progress: ${done.length}/180 days (${Math.round(done.length/180*100)}%)`;
}
function savePlanChecks(){const saved=JSON.parse(localStorage.getItem("planChecks")||"{}"),day=currentPlanDay();saved[day]=[...document.querySelectorAll("#planTasks .plan-check")].filter(x=>x.checked).map(x=>Number(x.dataset.index));localStorage.setItem("planChecks",JSON.stringify(saved));}
function completePlanDay(){savePlanChecks();const day=currentPlanDay(),done=JSON.parse(localStorage.getItem("completedPlanDays")||"[]");if(!done.includes(day))done.push(day);localStorage.setItem("completedPlanDays",JSON.stringify(done));updateStreak();if(day<180)localStorage.setItem("studyPlanDay",day+1);renderPlan180();}
function nextPlanDay(){const day=currentPlanDay();if(day<180){localStorage.setItem("studyPlanDay",day+1);renderPlan180();}}
window.completePlanDay=completePlanDay;window.nextPlanDay=nextPlanDay;

document.addEventListener("firebaseDataReady",()=>{syncCompletedTopics();updateProgress();if(window.currentSubject)loadSubject(window.currentSubject);});
window.onload=function(){updateProgress();updateStreak();updateTarget();loadNote();loadDarkMode();showBookmarks();loadMCQ();examCountdown();renderPlan180();};
