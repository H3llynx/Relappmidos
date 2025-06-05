// to avoir error messages with Quokka - has no effect on browser
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function(query) {
    return {
      matches: false, // or true to simulate mobile
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  };
}
//
const selectAvatar = document.querySelector(".select-avatar");
const backButton = document.getElementById("back-button");
const backButtonContainer = document.getElementById("back-button-container");
const clickZones = document.querySelectorAll(".click-zone");
const counter = document.querySelector(".counter");
const avatars = document.querySelectorAll(".avatar-img")

let currentUser = null;
const createdUsers = new Set();
const defaultPoints = {
  ears: 30, eyes: 50, chin: 15, beard: 15, nose: 10,
  forehead: 10, cheeks: 10, mouth: 100, neck: 10,
  whiskers: 10, muzzle: 20, "mouth (open)": 1000, "neck (sweaty)": 30
};

const userPartsMap = {};
const totalScores = {};
const clickCounts = {};

// ACCESSIBILITY AREA:
let srStatus = document.createElement("div");
    srStatus.id = "sr-status";
    srStatus.setAttribute("role", "status");
    srStatus.setAttribute("aria-live", "assertive");
    srStatus.className = "visually-hidden";
    document.body.appendChild(srStatus);
// and context:
srStatus.textContent = "Welcome! This silly little app is inspired by Sasha, our sweet but wildly affectionate pitbull mix. Despite her tough looks, the most dangerous thing she’ll do is ambush you with surprise licks! Use this app to track who’s getting the most kisses: her owners, Helene and Jordi, or Pixie the cat. Each lick scores points based on where Sasha lands. Whoever ends up with the highest score… probably needs a shower."
console.log(srStatus.textContent)

// ---- DYNAMIC BACKGROUND DEPENDING ON TIME ----------------------------
    const now = new Date();
    const hour = now.getHours();
    let dynamicBackgroundImg;
    let backgroundFolder;
    if (window.matchMedia("(max-width: 600px)").matches){
      backgroundFolder = "mobile";
    }
    else {backgroundFolder = "desktop";}
    if (hour >= 5 && hour < 7) {
      dynamicBackgroundImg = `url(pix/${backgroundFolder}/early_morning.png)`;
    }
    else if (hour >= 7 && hour < 11) {
      dynamicBackgroundImg = `url(pix/${backgroundFolder}/morning.png)`;
    }
    else if (hour >= 11 && hour < 19) {
      dynamicBackgroundImg = `url(pix/${backgroundFolder}/day.png)`;
    }
    else if (hour >= 19 && hour < 21) {
      dynamicBackgroundImg = `url(pix/${backgroundFolder}/sunset.png)`;
    }
    else {
      dynamicBackgroundImg = `url(pix/${backgroundFolder}/night.png)`;
    }
    if (window.matchMedia("(max-width: 600px)").matches) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), ${dynamicBackgroundImg}`
    }
    else {
      document.body.style.backgroundImage = `${dynamicBackgroundImg}`
    }

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
  const selectId = `unclick-select-${user}`;
  form.innerHTML = `
    <p style="color: #f0bd64;">Over-C-licked? Pick a value to remove licks:</p>
    <label for="${selectId}">Choose a body part to remove licks:</label>
    <select id="${selectId}"></select>
    <button class="unclick-btn" type="submit" tabindex="0">Remove</button>
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
      partCell.textContent = currentPartPoints - pointsToRemove;
      totalScores[user] -= pointsToRemove;
      console.log(`Updated points for this part: ${currentPartPoints}`)
      console.log(`New score: ${totalScores[user]}`)
      document.getElementById(`total-score-${user}`).textContent = totalScores[user];
      clickCounts[user][selectedPart] -= 1;
      // Accessibility:
      srStatus.textContent = `You are removing: ${selectedPart}, which represents ${pointsToRemove} points. Your total score is now ${totalScores[currentUser]}`;
      console.log(srStatus.textContent);
    }
    else {
      // Accessibility:
      srStatus.textContent = "You've not been licked there!"
      console.log(srStatus.textContent);
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
  // Accessibility:
  avatars.forEach(img => {
    if (img.id === user) {
      img.setAttribute("aria-selected", "true");
    } else {
      img.setAttribute("aria-selected", "false");
    }
  })
  srStatus.textContent = `You are playing with ${user}.`
  console.log(srStatus.textContent)
  //
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
    // Accessibility:
    srStatus.textContent = `Thank you for playing with Sasha and ${currentUser}! \
    Your current total score is: ${totalScores[currentUser]}.\
    We hope to see you again soon. You will now be redirected to the avatar selection area.`;
    console.log(srStatus.textContent)
    //
    // goodbye animation
    if (!/iPad/i.test(navigator.userAgent)) { // excluding iPad due to compatibility issue with video file
      const videoContainer = createElement("div", { className: "video-container" });
      let src
      if (currentUser === "pixie"){
        src = "vidx/pixie.mp4"
      } else {src = "vidx/sasha.mp4"}
      const video = createElement("video", { 
        src, 
        autoplay: true,
        muted: true,
        playsInline: true,
        preload: "auto",
        className: "video-mobile"
      });
      const goodbye = createElement("h1", {
        innerHTML: `<h1> Bye Bye ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}!<h1><h2>Current score: ${totalScores[currentUser]}</h2>`,
        className: "goodbye-title"
      });
      videoContainer.appendChild(video);
      videoContainer.appendChild(goodbye);
      document.body.appendChild(videoContainer);
      setTimeout(() => {
        videoContainer.remove();
      }, 4000);
    }
  //
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
const showFloatingScore = (e, zone, points) => {
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
// ---- OPENING MOUTH OPTIONS -------------------------------------------
const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "100%",
      minHeight: "100%",
      background: "rgba(0,0,0,0.6)",
      animation: "unset",
      zIndex: "1",
      opacity: "0",
      transition: "opacity 0.5s ease"
    });
const openMouthOptions = () => {
   // Accessibility:
  srStatus.textContent = "Click or press Tab to chose closed or open mouth.";
  console.log(srStatus.textContent)
  //
  const mouthContainer = document.getElementById(`mouth-options-${currentUser}`);
  // this addEventListener avoids the block content to run the function again when closing:
  mouthContainer.addEventListener('click', function(event) {
    event.stopPropagation();
  });
  mouthContainer.style.display = "flex";
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 10);
  overlay.onclick = closeMouthOptions;
};
// ---- CLOSING MOUTH OPTIONS --------------------------------------------
const closeMouthOptions = () => {
  const mouthContainer = document.getElementById(`mouth-options-${currentUser}`);
  overlay.style.opacity = "0";
  mouthContainer.style.display = "none";
  // the function belows removes the overlay after it's transition:
  overlay.addEventListener('transitionend', function handler() {
    overlay.removeEventListener('transitionend', handler);
    overlay.remove();
  });
}
// ---- ONCLICK COUNTER UPDATE -------------------------------------------
clickZones.forEach(zone => {
  const part = zone.dataset.part;
  let points = defaultPoints[part] || 0;
  zone.addEventListener("click", (e) => {
    showRipple(e, zone);
    showFloatingScore(e, zone, points);
    //
    if (part === "mouth" || part === "mouth (open)") {
      setTimeout(closeMouthOptions, 300);
    }
    //
    const partCell = document.getElementById(`${part}-${currentUser}`);
    if (partCell) {
      const current = parseInt(partCell.textContent) || 0;
      partCell.textContent = current + points;
      clickCounts[currentUser][part] += 1;
      console.log(`${currentUser}: clicks for ${part}: ${clickCounts[currentUser][part]}`);
    }
    totalScores[currentUser] += points;
    document.getElementById(`total-score-${currentUser}`).textContent = totalScores[currentUser];
      // Accessibility:
    srStatus.textContent = `You selected: ${part}, which scores ${points}. Your total score is now ${totalScores[currentUser]}`;
    console.log(srStatus.textContent);
  });
});

// ---- KEYBOARD EVENT LISTENERS -----------------------------------------
document.body.querySelectorAll('[role="button"]').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }   
    });
  });