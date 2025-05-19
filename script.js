const selectAvatar = document.querySelector(".select-avatar");
const backButton = document.getElementById("back-button");
const backButtonContainer = document.getElementById("back-button-container");
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

// ---- RETRIEVE AND INITIALIZE USERS AND THEIR BODY PARTS --------------
clickZones.forEach(zone => {
  const user = zone.dataset.user;
  const part = zone.dataset.part;
  if (!userPartsMap[user]) userPartsMap[user] = new Set();
  userPartsMap[user].add(part);
  totalScores[user] = 0;
  if (!clickCounts[user]) clickCounts[user] = {};
  clickCounts[user][part] = 0;
});

// Utility to create DOM elements quicker:
const createElement = (type, properties = {}) => {
  const el = document.createElement(type);
  Object.assign(el, properties);
  return el;
};

// ---- CREATES THE SCORE SCORE SECTION FOR EACH USER --------------------
const createScoreForUser = (user) => {
  if (createdUsers.has(user)) return console.log(`Welcome back ${user}!`);

  // Creates the table:
  const scoreTable = createElement("table", { id: `score-table-${user}`, className: "score-table" });
  scoreTable.innerHTML = `
    <thead><tr><th>Body parts</th><th>Points</th></tr></thead>
    <tbody id="score-body-${user}"></tbody>
  `;

  // Creates the unclick (points removal) form:
  const form = createElement("form", { 
    id: `unclick-${user}`, 
    className: "unclick-section"
  });
  form.innerHTML = `
    <p style="color: #f0bd64;">Over-C-licked? Pick a value to remove licks:</p>
    <select></select>
    <button class="unclick-btn" type="submit">Remove</button>
  `;

  // Retrieves element from the table and the form to be worked on:
  const scoreBody = scoreTable.querySelector("tbody");
  const dropdown = form.querySelector("select");

  // Creates a row / option for each body part (and user):
  userPartsMap[user].forEach(part => {
    const row = createElement("tr");
    row.innerHTML = `
      <td id="${part}">${part.charAt(0).toUpperCase() + part.slice(1)}</td>
      <td id="${part}-${user}">0</td>
    `;
    scoreBody.appendChild(row);
    const unclickOption = createElement("option", { value: part, textContent: part.charAt(0).toUpperCase() + part.slice(1) });
    dropdown.appendChild(unclickOption);
  });

  // Sets total score:
  const totalRow = createElement("tr");
  totalRow.innerHTML = `
    <td class="score">Total</td>
    <td id="total-score-${user}" class="score">0</td>
  `;
  scoreBody.appendChild(totalRow);

  // Makes the unclick / remove points button works:
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedPart = dropdown.value;
    const partCell = document.getElementById(`${selectedPart}-${user}`);
    const currentPartPoints = parseInt(partCell.textContent);
    const pointsToRemove = defaultPoints[selectedPart];
    if (currentPartPoints >= pointsToRemove){
      console.log(`Current points for this part: ${currentPartPoints}`)
      console.log(`Current score: ${totalScores[user]}`)
      console.log(`to remove: ${pointsToRemove}`)
      partCell.textContent = currentPartPoints - pointsToRemove;
      totalScores[user] -= pointsToRemove;
      console.log(`Updated points for this part: ${currentPartPoints}`)
      console.log(`New score: ${totalScores[user]}`)
      document.getElementById(`total-score-${user}`).textContent = totalScores[user];
      clickCounts[user][selectedPart] -= 1;
    }
    else {
      alert("You've not been licked there!")
    }
  });

  // Loads all the above to the HTML and creates the user:
  document.getElementById("score-container").append(scoreTable, form);
  createdUsers.add(user);
  console.log(`Welcome to the game ${user}!`);
};

// ---- AVATAR SELECTION ------------------------------------------------
const selectUser = (user) => {
  currentUser = user;
  selectAvatar.style.display = "none";
  backButtonContainer.style.display = "block";
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

  // mobile device animation only in vertical (portrait) orientation:
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent) && !/iPad/i.test(navigator.userAgent) &&
  (window.matchMedia("(orientation: portrait)").matches || window.innerHeight > window.innerWidth)) {
    const videoContainer = createElement("div", { className: "video-container" });
    const video = createElement("video", { 
      src: "vidx/sashita.mp4", 
      autoplay: true,
      muted: true,
      playsInline: true,
      className: "video-mobile"
    });
    const goodbye = createElement("h1", {
      textContent: `Bye Bye ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}`
    });
    Object.assign(goodbye.style, {
      animation: "scale-in-out 5s ease",
      position: "absolute",
      zIndex: 4,
      bottom: "10%",
      left: "22%",
      transform: "translate(-50%, 0)",
      color: "#5e9ca0",
      margin: 0,
      textAlign: "center",
      width: "max-content"
    });
    videoContainer.appendChild(video);
    videoContainer.appendChild(goodbye);
    document.body.appendChild(videoContainer);
    setTimeout(() => videoContainer.remove(), 5000)
  }
  ///
    document.getElementById(`face-${currentUser}`).style.display = "none";
    document.getElementById(`unclick-${currentUser}`).style.display = "none";
    counter.style.display = "none";
  }
  selectAvatar.style.display = "block";
  backButtonContainer.style.display = "none";
  backButton.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
  console.log(`Bye bye ${currentUser}!`);
  if (totalScores[currentUser]>0){
    console.log(`Current score: ${totalScores[currentUser]}!`);
    console.log(`Licking history:`);
    console.log(clickCounts[currentUser]);
  }
  currentUser = null;
};

// ---- ONCLICK VISUAL RESPONSE -----------------------------------------
const showRipple = (e, zone) => {
  const ripple = createElement("div", { className: "touch-feedback" });
  const rect = zone.getBoundingClientRect();
  const x = (e.touches && e.touches[0] && e.touches[0].clientX) || e.clientX;
  const y = (e.touches && e.touches[0] && e.touches[0].clientY) || e.clientY;
  ripple.style.left = `${x - rect.left}px`;
  ripple.style.top = `${y - rect.top}px`;
  zone.appendChild(ripple);
  setTimeout(() => ripple.remove(), 400);
};

// ---- ONCLICK FLOATING POINTS -----------------------------------------
const showFloatingScore = (e, points) => {
  const bubble = createElement("div", { className: "floating-score", textContent: `+${points}` });
  const pageX = (e.touches && e.touches[0] && e.touches[0].pageX) || e.pageX;
  const pageY = (e.touches && e.touches[0] && e.touches[0].pageY) || e.pageY;
  Object.assign(bubble.style, {
    position: "absolute", left: `${pageX}px`, top: `${pageY}px`,
    transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: "1000"
  });
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 700);
};

// ---- ONCLICK COUNTER UPDATE -------------------------------------------
clickZones.forEach(zone => {
  const part = zone.dataset.part;
  const points = defaultPoints[part] || 0;
  zone.addEventListener("click", (e) => {
    showRipple(e, zone);
    showFloatingScore(e, points);
    const partCell = document.getElementById(`${part}-${currentUser}`);
    if (partCell) {
      const current = parseInt(partCell.textContent) || 0;
      partCell.textContent = current + points;
      clickCounts[currentUser][part] += 1;
      console.log(`${currentUser}: clicks for ${part}: ${clickCounts[currentUser][part]}`);
    }
    totalScores[currentUser] += points;
    document.getElementById(`total-score-${currentUser}`).textContent = totalScores[currentUser];
  });
});