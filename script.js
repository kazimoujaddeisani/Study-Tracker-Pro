// =====================================
// Study Tracker Pro 3.0
// Final JavaScript
// =====================================



// ================================
// Topic Database
// ================================


const topicData = {

    bangla: banglaTopics,

    english: englishTopics,

    math: mathTopics,

    gk: gkTopics

};




// ================================
// Storage
// ================================


let completedTopics =
JSON.parse(localStorage.getItem("completedTopics")) || [];


let bookmarks =
JSON.parse(localStorage.getItem("bookmarks")) || [];





// ================================
// Load Subject
// ================================


function loadSubject(subject){


let list =
document.getElementById("topicList");


let title =
document.getElementById("subjectTitle");



let info =
subjects.find(
item => item.id === subject
);



title.innerHTML =
info.name;



list.innerHTML="";



topicData[subject].forEach(
(topic,index)=>{


let id =
subject+"-"+index;



let checked =
completedTopics.includes(id);



let div =
document.createElement("div");


div.className="topic-item";



div.innerHTML = `

<span class="topic-name ${checked ? "completed":""}">
${index+1}. ${topic}
</span>


<div>


<input 
type="checkbox"
class="topic-check"
${checked ? "checked":""}
onclick="completeTopic('${subject}',${index})">


<button 
onclick="addBookmark('${subject}',${index})">

⭐

</button>


</div>

`;



list.appendChild(div);


});


}







// ================================
// Complete Topic
// ================================


function completeTopic(subject,index){


let id =
subject+"-"+index;



if(completedTopics.includes(id)){


completedTopics =
completedTopics.filter(
item=>item!==id
);


}

else{


completedTopics.push(id);


}



localStorage.setItem(

"completedTopics",

JSON.stringify(completedTopics)

);



updateProgress();


loadSubject(subject);


}









// ================================
// Progress
// ================================


function updateProgress(){


let total=0;



Object.values(topicData)
.forEach(item=>{

total+=item.length;

});



let percent =
Math.round(
(completedTopics.length/total)*100
);



let bar =
document.getElementById("progressBar");


let text =
document.getElementById("progressText");



if(bar){

bar.style.width =
percent+"%";

}



if(text){

text.innerHTML =

"Complete: "
+
completedTopics.length
+
"/"
+
total
+
" ("
+
percent
+
"%)";

}



}









// ================================
// Search
// ================================


function searchTopic(){


let input =
document.getElementById("searchInput")
.value
.toLowerCase();



document.querySelectorAll(".topic-item")
.forEach(item=>{


if(
item.innerText
.toLowerCase()
.includes(input)

){


item.style.display="flex";


}

else{


item.style.display="none";


}


});


}








// ================================
// Reset
// ================================


function resetProgress(){


if(confirm("সব Progress Reset করবেন?")){


localStorage.removeItem(
"completedTopics"
);



completedTopics=[];



location.reload();


}


}









// ================================
// Routine + Streak
// ================================


function saveRoutine(){


let checks =
document.querySelectorAll(".routine-check");



let complete=true;



checks.forEach(check=>{


if(!check.checked){

complete=false;

}


});



if(complete){


let today =
new Date()
.toDateString();



let last =
localStorage.getItem(
"lastStudyDay"
);



if(last!==today){


let streak =
Number(localStorage.getItem("streak"))
||0;



streak++;



localStorage.setItem(
"streak",
streak
);


}



localStorage.setItem(
"lastStudyDay",
today
);



updateStreak();


}



}





function updateStreak(){


let streak =
localStorage.getItem("streak")
||0;



let box =
document.getElementById("streakText");



if(box){

box.innerHTML =
"🔥 Current Streak: "
+
streak
+
" দিন";

}


}









// ================================
// Daily Target
// ================================


function saveTarget(){


let value =
document.getElementById("dailyTarget")
.value;



localStorage.setItem(
"dailyTarget",
value
);



updateTarget();


}




function updateTarget(){


let target =
localStorage.getItem("dailyTarget")
||0;



let box =
document.getElementById("targetStatus");



if(box){

box.innerHTML =
"🎯 আজকের Target: "
+
target
+
" Topic";

}


}









// ================================
// Notes
// ================================


function saveNote(){


let note =
document.getElementById("noteInput")
.value;



localStorage.setItem(
"studyNote",
note
);



document.getElementById("noteStatus")
.innerHTML =
"✅ Note Saved";


}





function loadNote(){


let note =
localStorage.getItem("studyNote");



let box =
document.getElementById("noteInput");



if(note && box){

box.value=note;

}


}








// ================================
// Dark Mode
// ================================


function toggleDarkMode(){


document.body.classList.toggle("dark");



localStorage.setItem(

"darkMode",

document.body.classList.contains("dark")

);


}





function loadDarkMode(){


if(
localStorage.getItem("darkMode")
==="true"

){


document.body.classList.add("dark");


}


}








// ================================
// Bookmark
// ================================


function addBookmark(subject,index){


let id =
subject+"-"+index;



if(!bookmarks.includes(id)){


bookmarks.push(id);



localStorage.setItem(

"bookmarks",

JSON.stringify(bookmarks)

);


}



showBookmarks();


}




function showBookmarks(){


let box =
document.getElementById("bookmarkList");



if(!box)return;



if(bookmarks.length===0){


box.innerHTML =
"No Bookmark Added";


return;


}



box.innerHTML="";



bookmarks.forEach(item=>{


let div =
document.createElement("div");



div.className =
"topic-item";



div.innerHTML =
"⭐ "+item;



box.appendChild(div);



});


}









// ================================
// MCQ
// ================================


const mcqData=[


{
question:"বাংলা সাহিত্যের প্রাচীন নিদর্শন কোনটি?",
options:[
"চর্যাপদ",
"গীতাঞ্জলি",
"বিষাদ সিন্ধু",
"কপালকুণ্ডলা"
],
answer:0
},


{
question:"বাংলাদেশের জাতীয় কবি কে?",
options:[
"রবীন্দ্রনাথ ঠাকুর",
"কাজী নজরুল ইসলাম",
"জীবনানন্দ দাশ",
"সুকান্ত ভট্টাচার্য"
],
answer:1
}


];



let currentMCQ=0;




function loadMCQ(){


let q =
mcqData[currentMCQ];



document.getElementById("mcqQuestion")
.innerHTML =
q.question;



let box =
document.getElementById("mcqOptions");



box.innerHTML="";



q.options.forEach(
(option,index)=>{


let btn =
document.createElement("button");


btn.className="mcq-option";


btn.innerHTML=option;



btn.onclick=function(){


document.getElementById("mcqResult")
.innerHTML =
index===q.answer
?
"✅ Correct"
:
"❌ Wrong";


};



box.appendChild(btn);


});


}




function nextMCQ(){


currentMCQ++;



if(currentMCQ>=mcqData.length){

currentMCQ=0;

}



loadMCQ();


}









// ================================
// Countdown
// ================================


function examCountdown(){


let exam =
new Date("2026-12-31")
.getTime();



let now =
new Date()
.getTime();



let days =
Math.floor(
(exam-now)/(1000*60*60*24)
);



let box =
document.getElementById("countdown");



if(box){

box.innerHTML =
"🔥 বাকি "
+
days
+
" দিন";

}


}





// ================================
// Load
// ================================


window.onload=function(){


updateProgress();

updateStreak();

updateTarget();

loadNote();

loadDarkMode();

showBookmarks();

loadMCQ();

examCountdown();


};