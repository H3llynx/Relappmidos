const selectAvatar = document.querySelector(".select-avatar");
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
  const defaultPoints = {
    ears: 30,
    eyes: 50,
    chin: 15,
    beard: 15,
    nose: 10,
    forehead: 10,
    cheeks: 10,
    mouth: 100,
    neck: 10,
    whiskers: 10,
    muzzle: 20
  };
  // Collect users and body parts from .click-zone elements
  const zones = document.querySelectorAll(".click-zone");
  const users = new Set(); // I will have 1 set per user - apparently easier to work with to avoid dupes.
  const userPartsMap = {}; 

  // Associate each user to their body parts:
  zones.forEach(zone => {
    const user = zone.dataset.user; // retrieve the data-user (repeated but the Set will remove duplicate)
    const part = zone.dataset.part; // retrieve the body parts from data-parts
    users.add(user); // adds user to my Set to remove dupes
    if (!userPartsMap[user]) {
      userPartsMap[user] = new Set(); // will create the Set only if it does not already exist.
    }
    userPartsMap[user].add(part); // associate each user to their body parts. Ex: {helene: Set { "ear", "chin", "eye" },}
  });

  const userList = Array.from(users); // converts Set to List so I can work with it.
  
  // Definition initial total score values:
  const totalScores = {};

  userList.forEach(user => {
    totalScores[user] = 0;
  });
  // Access the dedicated user table and fill it:
  userList.forEach(user => {
    const scoreBody = document.getElementById(`score-body-${user}`);
    const partsForUser = Array.from(userPartsMap[user] || []);
    partsForUser.forEach(part => {
      const row = document.createElement("tr");
      const partCell = document.createElement("td");
      partCell.textContent = part;
      row.appendChild(partCell);
  
      const td = document.createElement("td");
      td.id = `${part}-${user}`;
      td.textContent = "0";
      row.appendChild(td);
  
      scoreBody.appendChild(row);
    });
  
    const totalRow = document.createElement("tr");
    const totalLabel = document.createElement("td");
    totalLabel.textContent = "Total";
    totalLabel.classList.add("score");
    totalRow.appendChild(totalLabel);
  
    const totalScoreCell = document.createElement("td");
    totalScoreCell.id = `total-score-${user}`;
    totalScoreCell.textContent = "0";
    totalScoreCell.classList.add("score");
    totalRow.appendChild(totalScoreCell);
  
    scoreBody.appendChild(totalRow);
  });

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
      const points = defaultPoints[part] || 0;
      if (!(part in defaultPoints)) {
        alert("this one does not count!");
      }

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