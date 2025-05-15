const helene = document.getElementById("helene");
const jordi = document.getElementById("jordi");
const selectAvatar = document.querySelector(".select-avatar");
const counterHelene = document.getElementById("counter-helene");
const counterJordi = document.getElementById("counter-jordi");
const faceHelene = document.getElementById("face-helene");
const faceJordi = document.getElementById("face-jordi");
const backButton = document.getElementById("back-button");
const backButtonContainer = document.getElementById("back-button-container")
const clickZone = document.querySelectorAll(".click-zone");

let currentUser = null;

const selectUser = (user) => {
  currentUser = user;
  selectAvatar.style.display = "none";
  document.getElementById(`counter-${user}`).style.display = "block";
  document.getElementById(`face-${user}`).style.display = "block";
  backButton.style.display = "block";
  backButtonContainer.style.padding = "30px 0";
};

const goBack = () => {
  if (currentUser) {
    document.getElementById(`counter-${currentUser}`).style.display = "none";
    document.getElementById(`face-${currentUser}`).style.display = "none";
  }
  selectAvatar.style.display = "block";
  backButton.style.display = "none";
  backButtonContainer.style.padding = "0";
  currentUser = null;
};

document.addEventListener("DOMContentLoaded", () => {
  const totalScores = {
    helene: 0,
    jordi: 0,
  };
// adds floating points on the avatar's face for each click:
  const showFloatingScore = (e, points) => {
    const bubble = document.createElement("div");
    bubble.classList.add("floating-score");
    bubble.textContent = `+${points}`;
    // ensures position is calculated correctly even on zoomed mobile devices.
    // Explatation: page the position relative to the document, which is more consistent during zoom.
    const pageX = e.touches?.[0]?.pageX ?? e.pageX;
    const pageY = e.touches?.[0]?.pageY ?? e.pageY;

    bubble.style.position = "absolute";
    bubble.style.left = `${pageX}px`;
    bubble.style.top = `${pageY}px`;
    bubble.style.transform = "translate(-50%, -100%)";
    bubble.style.pointerEvents = "none";
    bubble.style.zIndex = "1000";
    // must me added to the body to avoid CSS rotation on mapped zones:
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 700);
  };

  clickZone.forEach((zone) => {
    // adds touch feedback on click:
    const showRipple = (e) => {
      const ripple = document.createElement("div");
      ripple.classList.add("touch-feedback");

      const rect = zone.getBoundingClientRect();
      const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
      const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;

      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      zone.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    };

    zone.addEventListener("click", (e) => {
      showRipple(e);
      // counter logic:
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

      showFloatingScore(e, points);
    });
  });
});