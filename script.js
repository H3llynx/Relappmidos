const helene = document.getElementById("helene");
const jordi = document.getElementById("jordi");
const selectAvatar = document.querySelector(".select-avatar");
const counterHelene = document.getElementById("counter-helene");
const counterJordi = document.getElementById("counter-jordi");
const faceHelene = document.getElementById("face-helene");
const faceJordi = document.getElementById("face-jordi");
const backButton = document.getElementById("back-button");

let currentUser = null;

const selectUser = (user) => {
  currentUser = user;
  selectAvatar.style.display = "none";
  document.getElementById(`counter-${user}`).style.display = "block";
  document.getElementById(`face-${user}`).style.display = "block";
  backButton.style.display = "block";
};

const goBack = () => {
  if (currentUser) {
    document.getElementById(`counter-${currentUser}`).style.display = "none";
    document.getElementById(`face-${currentUser}`).style.display = "none";
  }
  selectAvatar.style.display = "block";
  backButton.style.display = "none";
  currentUser = null;
};

document.addEventListener("DOMContentLoaded", () => {
    const totalScores = {
      helene: 0,
      jordi: 0
    };
  
    document.querySelectorAll(".click-zone").forEach(zone => {
      zone.addEventListener("click", () => {
        const user = zone.dataset.user;
        const part = zone.dataset.part;
        const points = parseInt(zone.dataset.points) || 0;
        const partId = `${part}-${user}`;
        const partCell = document.getElementById(partId);
        if (partCell) {
          const current = parseInt(partCell.textContent) || 0;
          partCell.textContent = current + points;
        }
        totalScores[user] += points;
        const totalCell = document.getElementById(`total-score-${user}`);
        if (totalCell) {
          totalCell.textContent = totalScores[user];
        }
      });
    });
  });
  