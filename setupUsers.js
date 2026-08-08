// =====================================
// Study Tracker Pro
// Create Users Without Resetting Progress
// =====================================

console.log("Setup Users Loaded");

const defaultUsers = {
    sani: { name: "Sani", pin: "2001" },
    sajin: { name: "Sajin", pin: "2005" },
    rifa: { name: "Rifa", pin: "2003" }
};

function createDefaultUsers() {
    if (!database) return;

    Object.keys(defaultUsers).forEach(function(user) {
        database.ref("users/" + user).once("value").then(function(snapshot) {
            if (!snapshot.exists()) {
                database.ref("users/" + user).set({
                    name: defaultUsers[user].name,
                    pin: defaultUsers[user].pin,
                    progress: 0,
                    completedTopics: []
                });
            }
        }).catch(function(error) {
            console.error("User Setup Error:", error);
        });
    });
}

window.addEventListener("load", function() {
    createDefaultUsers();
});
