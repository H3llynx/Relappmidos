const selectAvatar = document.querySelector(".select-avatar");
const backButton = document.getElementById("back-button");
const clickZones = document.querySelectorAll(".click-zone");
const counter = document.querySelector(".counter");

let currentUser = null;
const createdUsers = new Set();
const defaultPoints = {
  ears: 30, eyes: 50, chin: 15, beard: 15, nose: 10,
  forehead: 10, cheeks: 10, mouth: 100, neck: 10,
  whiskers: 10, muzzle: 20
};

const userPartsMap = {};
const totalScores = {};
const clickCounts = {};
const clickHistory = {};
const lastComboTime = {};

// ---- RETRIEVE AND INITIALIZE USERS AND THEIR BODY PARTS --------------
clickZones.forEach(zone => {
  const user = zone.dataset.user;
  const part = zone.dataset.part;
  if (!userPartsMap[user]) userPartsMap[user] = new Set();
  userPartsMap[user].add(part);
  totalScores[user] = 0;
  clickHistory[user] = [];
  if (!clickCounts[user]) clickCounts[user] = {};
  clickCounts[user][part] = 0;
});

// Utility to create DOM elements quicker:
const createElement = (type, properties = {}) => {
  const el = document.createElement(type);
  Object.assign(el, properties);
  return el;
};

// ---- CREATE SCORE SECTION (TABLE AND UNCLICK DROPDOWN) FOR A USER ----
const createScoreForUser = (user) => {
  if (createdUsers.has(user)) return console.log(`Welcome back ${user}!`);
  // Sets the table:
  const scoreTable = createElement("table", { id: `score-table-${user}`, className: "score-table" });
  scoreTable.innerHTML = `
    <thead><tr><th>Body parts</th><th>Points</th></tr></thead>
    <tbody id="score-body-${user}"></tbody>
  `;
  // Sets the unclick (points removal) form:
  const form = createElement("form", { 
    id: `unclick-${user}`, 
    className: "unclick-section",
  });
  form.innerHTML = `
    <p style="color: #f0bd64;">Over-C-licked? Pick a value to remove licks:</p>
    <select></select>
    <button class="unclick">Remove</button>
  `;
  // Retrieves element from the table and the form to be worked on:
  const scoreBody = scoreTable.querySelector("tbody");
  const dropdown = form.querySelector("select");
  // Creates a row / option for each body part (and user):
  userPartsMap[user].forEach(part => {
    const row = createElement("tr");
    row.innerHTML = `
      <td id="${part}">${part}</td>
      <td id="${part}-${user}">0</td>
    `;
    scoreBody.appendChild(row);
    const unclickOption = createElement("option", { value: part, textContent: part });
    dropdown.appendChild(unclickOption);
  });
  // Sets total score:
  const totalRow = createElement("tr");
  totalRow.innerHTML = `
    <td class="score">Total</td>
    <td id="total-score-${user}" class="score">0</td>
  `;
  scoreBody.appendChild(totalRow);
  // Adds all the above and creates the user:
  document.getElementById("score-container").append(scoreTable, form);
  createdUsers.add(user);
  console.log(`Welcome to the game ${user}!`);
};

// ---- AVATAR SELECTION ------------------------------------------------
const selectUser = (user) => {
  currentUser = user;
  selectAvatar.style.display = "none";
  backButton.style.display = "block";
  document.getElementById(`face-${user}`).style.display = "block";
  counter.style.display = "block";
  createScoreForUser(user);
  document.querySelectorAll(".score-table, .unclick-section").forEach(el => el.style.display = "none");
  document.getElementById(`score-table-${user}`).style.display = "table";
  document.getElementById(`unclick-${user}`).style.display = "block";
};

// ---- GO BACK BUTTON --------------------------------------------------
const goBack = () => {
  if (currentUser) {
    document.getElementById(`face-${currentUser}`).style.display = "none";
    document.getElementById(`unclick-${currentUser}`).style.display = "none";
    counter.style.display = "none";
  }
  selectAvatar.style.display = "block";
  backButton.style.display = "none";
  console.log(`Bye bye ${currentUser}!`);
  if (totalScores[currentUser]>0){
    console.log(`Current score: ${totalScores[currentUser]}!`);
  }
  currentUser = null;
};

// ---- ONCLICK VISUAL RESPONSE -----------------------------------------
const showRipple = (e, zone) => {
  const ripple = createElement("div", { className: "touch-feedback" });
  const rect = zone.getBoundingClientRect();
  ripple.style.left = `${(e.touches?.[0]?.clientX ?? e.clientX) - rect.left}px`;
  ripple.style.top = `${(e.touches?.[0]?.clientY ?? e.clientY) - rect.top}px`;
  zone.appendChild(ripple);
  setTimeout(() => ripple.remove(), 400);
};

// ---- ONCLICK FLOATING SCORE ------------------------------------------
const showFloatingScore = (e, points) => {
  const bubble = createElement("div", { className: "floating-score", textContent: `+${points}` });
  const pageX = e.touches?.[0]?.pageX ?? e.pageX;
  const pageY = e.touches?.[0]?.pageY ?? e.pageY;
  Object.assign(bubble.style, {
    position: "absolute", left: `${pageX}px`, top: `${pageY}px`,
    transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: "1000"
  });
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 700);
};

// ---- COMBO SECTION (to be improved) ----------------------------------
const handleCombo = (user, part, e) => {
  const now = Date.now();
  clickHistory[user].push({ part, time: now });
  if (clickHistory[user].length > 10) clickHistory[user].shift();

  const recent = clickHistory[user].slice(-3);
  if (
    recent.length === 3 &&
    recent.every(entry => entry.part === part) &&
    (recent[2].time - recent[0].time) <= 1000 &&
    (now - lastComboTime[user]) >= 300
  ) {
    lastComboTime[user] = now;
    const comboBubble = createElement("div", { className: "floating-score combo", textContent: "LICK ATTACK! x3" });
    const faceContainer = document.getElementById(`face-${user}`);
    comboBubble.style.position = "absolute";
    comboBubble.style.left = "40%";
    comboBubble.style.top = "30%";
    comboBubble.style.transform = "translate(-50%, -50%)";
    faceContainer.appendChild(comboBubble);
    setTimeout(() => comboBubble.remove(), 1000);
  }
};

// ---- ADD EVENT LISTENERS ---------------------------------------------
clickZones.forEach(zone => {
  const user = zone.dataset.user;
  const part = zone.dataset.part;
  const points = defaultPoints[part] || 0;
  
// ---- COUNTER FUNTION -------------------------------------------------
  zone.addEventListener("click", (e) => {
    showRipple(e, zone);
    showFloatingScore(e, points);

    const partCell = document.getElementById(`${part}-${user}`);
    if (partCell) {
      const current = parseInt(partCell.textContent) || 0;
      partCell.textContent = current + points;
      clickCounts[user][part] += 1;
      console.log(`${user}: clicks for ${part}: ${clickCounts[user][part]}`);
    }

    totalScores[user] += points;
    document.getElementById(`total-score-${user}`).textContent = totalScores[user];

    handleCombo(user, part, e);
  });
  
// ---- UNCLICK BUTTON (remove points) ----------------------------------
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("unclick")) {
    e.preventDefault();
    const dropdown = document.querySelector("select");
    const selectedPart = dropdown.value;
    const partCell = document.getElementById(`${selectedPart}-${currentUser}`);
    const partNameCell = document.getElementById(`${selectedPart}`);
    if (partCell && partNameCell) {
      const currentPoints = parseInt(partCell.textContent) || 0;
      const pointsToRemove = defaultPoints[selectedPart] || 0;
      clickCounts[currentUser][selectedPart] -= 1;
      if (currentPoints >= pointsToRemove && clickCounts[currentUser][selectedPart] > 0) {
        partCell.textContent = currentPoints - pointsToRemove;
        console.log(`current points for ${selectedPart}: ${currentPoints}`);
        console.log(`points to remove for ${selectedPart}: ${pointsToRemove}`);
        console.log(`-${pointsToRemove} points removed from ${selectedPart}!`);
        totalScores[currentUser] -= pointsToRemove;
        console.log(`New score: ${totalScores[currentUser]}`)
        document.getElementById(`total-score-${currentUser}`).textContent = totalScores[currentUser];
      } else if (currentPoints < pointsToRemove) {
        console.log(`Not enough points to remove from ${selectedPart}.`);
      }
    }
  }
});
});
