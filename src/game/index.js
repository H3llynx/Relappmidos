import { defaultPoints } from "./config.js";
import { getFacePartId, getUserInfo, getUserScore, sendRelamido } from "./services.js";
import { createElement } from "./utils.js";
import { showFloatingScore, showRipple } from "./visuals.js";

const selectAvatar = document.querySelector(".select-avatar");
const backButton = document.getElementById("back-button");
const backButtonContainer = document.getElementById("back-button-container");
const clickZones = document.querySelectorAll(".click-zone");
const mouthZones = document.querySelectorAll(".mouth-zone");
const counter = document.querySelector(".counter");
const avatars = document.querySelectorAll(".avatar-img");
const srStatus = document.getElementById("sr-status");
const overlay = document.querySelector(".overlay");
const logoutButton = document.getElementById("logout");
const addAvatar = document.getElementById("add-avatar");
const unlickDialog = document.getElementById("guest-wrong-unlick");

let currentUser = null;
const createdUsers = new Set();
let playerId = null;
let playerType = null;

const userPartsMap = {};
const totalScores = {};
const clickCounts = {};


// ---- DISPLAYS AVATARS AND OPTIONS DEPENDING ON AUTHENTICATED USER ----
const loggedInUser = localStorage.getItem("loggedInUser");

const checkIfLogged = () => {
  if (!loggedInUser) {
    window.location.replace('login.html');
  } else if (loggedInUser === "pixie") {
    document.querySelectorAll(".avatar-img").forEach((img) => {
      if (img.id !== loggedInUser) document.getElementById(`${img.id}-container`).style.display = "none";
    });
    console.warn("You are in guest mode. Your score won't be saved.");
    logoutButton.textContent = "Back"
    addAvatar.style.display = "none"
  } else {
    document.querySelectorAll(".avatar-img").forEach(async (img) => {
      const userInfo = await getUserInfo(img.id);
      const userId = userInfo.id;
      const score = await getUserScore(userId);
      if (img.id === loggedInUser) {
        img.style.opacity = "0.6";
        document.getElementById(`${img.id}-container`).style.backdropFilter = "blur(2px)";
        document.getElementById(`${img.id}-container`).style.webkitBackdropFilter = "blur(2px)";
        img.style.pointerEvents = "none";
        img.tabIndex = -1;
        document.getElementById(`${img.id}-container`).innerHTML += `<span style="color:#e4a434">Your score: ${score}</span>`
      }
      else {
        document.getElementById(`${img.id}-container`).innerHTML += `<span>Current score: ${score}</span>`
      }
    });
  }
}

checkIfLogged()

// ---- DEFINE GAME INIT AND RESET --------------------------------------
const reset = () => {
  if (currentUser) {
    document.getElementById(`face-${currentUser}`).style.display = "none";
    document.getElementById(`score-table-${currentUser}`).style.display = "none";
  }
  selectAvatar.style.display = "block";
  counter.style.display = "none";
  backButtonContainer.style.display = "none";
  currentUser = null;
  playerId = null;
  playerType = null;
};

const init = (avatar) => {
  srStatus.textContent = `You are playing with ${avatar}.`;
  selectAvatar.style.display = "none";
  backButtonContainer.style.display = "flex";
  document.getElementById(`face-${avatar}`).style.display = "block";
  counter.style.display = "block";
  document.getElementById(`score-table-${avatar}`).style.display = "table";
  // Guest mode - slurp delete option:
  if (loggedInUser === "pixie") {
    document.getElementById(`unclick-${avatar}`).style.display = "block";
  }
};

// ---- RETRIEVE AND INITIALIZE USERS AND THEIR BODY PARTS --------------
const registerClickZones = async () => {
  for (const zone of clickZones) {
    const user = zone.dataset.user;
    const part = zone.dataset.part;
    if (!userPartsMap[user]) userPartsMap[user] = new Set();
    userPartsMap[user].add(part);
    if (!clickCounts[user]) clickCounts[user] = {};
    clickCounts[user][part] = 0;
  }
};

// ---- CREATES THE COUNTER SECTION FOR EACH USER -----------------------
const createUserTable = async (user) => {
  const table = createElement("table", {
    id: `score-table-${user}`,
    className: "score-table",
  });
  table.innerHTML = `
    <thead><tr><th>Body parts</th><th>Points</th></tr></thead>
    <tbody id="score-body-${user}"></tbody>
  `;
  const body = table.querySelector("tbody");
  userPartsMap[user].forEach((part) => {
    const row = createElement("tr");
    row.innerHTML = `
      <td id="${part}">${part.charAt(0).toUpperCase() + part.slice(1)}</td>
      <td id="${part}-${user}">0</td>
    `;
    body.appendChild(row)
  });
  const totalRow = createElement("tr");

  const total = totalScores[user]

  totalRow.innerHTML = `
  <td class="score">Total</td>
  <td id="total-score-${user}" class="score">${total}</td>
`;
  body.appendChild(totalRow);
  return table;
};

const createScoreForUser = async (user) => {
  if (createdUsers.has(user)) return;
  const table = await createUserTable(user);
  const scoreContainer = document.getElementById("score-container");
  if (loggedInUser === "pixie") scoreContainer.append(table, createDeleteForm(user));
  else scoreContainer.append(table);
  createdUsers.add(user);
};

// Slurp delete form - only available in guest mode
const createDeleteForm = (user) => {
  const form = createElement("form", {
    id: `unclick-${user}`,
    className: "unclick-section",
  });
  const selectId = `unclick-select-${user}`;
  form.innerHTML = `
    <p style="color: #f0bd64;">Over-C-licked? Pick a value to remove licks:</p>
    <label for="${selectId}">Choose a body part to remove licks:</label>
    <select id="${selectId}"></select>
    <button class="unclick-btn no-full-width" type="submit" tabindex="0">Remove</button>
  `;
  const dropdown = form.querySelector("select");
  userPartsMap[user].forEach((part) => {
    const unclickOption = createElement("option", {
      value: part,
      textContent: part.charAt(0).toUpperCase() + part.slice(1),
    });
    dropdown.appendChild(unclickOption);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedPart = dropdown.value;
    const partCell = document.getElementById(`${selectedPart}-${user}`);
    const currentPartPoints = parseInt(partCell.textContent);
    const pointsToRemove = defaultPoints[selectedPart];
    if (currentPartPoints >= pointsToRemove) {
      partCell.textContent = currentPartPoints - pointsToRemove;
      totalScores[user] -= pointsToRemove;
      console.log(`Updated points for this part: ${currentPartPoints}`);
      console.log(`New score: ${totalScores[user]}`);
      document.getElementById(`total-score-${user}`).textContent =
        totalScores[user];
      clickCounts[user][selectedPart] -= 1;
      srStatus.textContent = `You are removing: ${selectedPart}, which represents ${pointsToRemove} points. Your total score is now ${totalScores[currentUser]}`;
    } else {
      srStatus.textContent = "You've not been licked there!";
      unlickDialog.showModal();
      unlickDialog.querySelector(".closeButton").addEventListener("click", () => unlickDialog.close());
      unlickDialog.addEventListener("click", (e) => {
        if (e.target === unlickDialog) {
          unlickDialog.close()
        }
      });
    }
  });
  return form;
};

// ---- AVATAR SELECTION ------------------------------------------------
const registerSelectUserEvent = () => {
  avatars.forEach((avatar) =>
    avatar.addEventListener("click", async () => {
      const player = avatar.id;
      currentUser = player;
      // Accessibility: aria selected on selected avatar:
      avatars.forEach((avatar) =>
        avatar.setAttribute("aria-selected", avatar.id === player ? "true" : "false")
      );
      // if not in guest mode, get the user id and score from API:
      if (loggedInUser !== "pixie") {
        const selectedPlayer = await getUserInfo(player);
        playerId = selectedPlayer.id;
        playerType = selectedPlayer.type;
        totalScores[currentUser] = await getUserScore(playerId);
        console.log(`You are logged in as ${loggedInUser} and licking ${player} (user id: ${playerId}, user type: ${playerType})`);
      } else {
        // guest mode:
        totalScores[currentUser] = 0;
      }
      await createScoreForUser(currentUser);
      init(player);
    })
  );
};

// ---- GO BACK BUTTON --------------------------------------------------
const registerGoBackEvent = () => {
  backButton.addEventListener("click", () => {
    if (currentUser) {
      srStatus.textContent = `Thank you for playing with Sasha and ${currentUser}! \
      Your current total score is: ${totalScores[currentUser]}.\
      We hope to see you again soon. You will now be redirected to the avatar selection area.`;
      if (!/iPad/i.test(navigator.userAgent)) {
        // 👆 excluding iPad due to compatibility issue with my iPad and the video file
        let src;
        if (currentUser === "pixie") {
          src = "assets/video/pixie.mp4";
        } else {
          src = "assets/video/sasha.mp4";
        }
        const video = createElement("video", {
          src,
          autoplay: true,
          muted: true,
          playsInline: true,
          preload: "auto",
          className: "video-mobile",
        });
        const goodbye = createElement("h1", {
          innerHTML: `<h1> ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)
            } survived the slurp attack!<h1><h2>Total score: ${totalScores[currentUser]}</h2>`,
          className: "goodbye-title",
        });
        overlay.appendChild(video);
        overlay.appendChild(goodbye);
        overlay.classList.add("visible");
        const exitAnimation = () => {
          overlay.classList.remove("visible");
          overlay.addEventListener("transitionend", function handler() {
            overlay.removeEventListener("transitionend", handler);
            video.remove();
            goodbye.remove();
          });
        };
        setTimeout(() => {
          exitAnimation();
        }, 3500);
        overlay.addEventListener("click", exitAnimation);
      };
      // Guest mode: delete form:
      if (loggedInUser === "pixie") {
        document.getElementById(`unclick-${currentUser}`).style.display = "none";
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log(`Bye bye ${currentUser}!`);
    if (totalScores[currentUser] > 0) {
      console.log(`Current score: ${totalScores[currentUser]}!`);
      console.log(`Licking history:`);
      console.log(clickCounts[currentUser]);
    }
    reset();
  });
};

// ---- OPENING MOUTH OPTIONS -------------------------------------------
const registerOpenMouthEvents = () => {
  mouthZones.forEach((zone) => {
    zone.addEventListener("click", () => {
      srStatus.textContent =
        "Click or press Tab to chose closed or open mouth.";
      const mouthContainer = document.getElementById(
        `mouth-options-${currentUser}`
      );
      mouthContainer.style.display = "flex";
      overlay.classList.add("visible");
      // FOCUS MANAGEMENT (KEYBOARD NAVIGATION):
      // Saved last clicked element to return focus to it when closing mouth options:
      zone._lastFocus = document.activeElement;
      // Focus the first mouth option
      const focusable = mouthContainer.querySelectorAll('img[tabindex="0"]');
      if (focusable.length) focusable[0].focus();
      // Trap focus inside mouth options
      const trapFocus = (e) => {
        if (e.key === "Escape") {
          closeMouthOptions();
          mouthContainer.removeEventListener("keydown", trapFocus);
          if (zone._lastFocus) zone._lastFocus.focus();
          return;
        }
        else if (e.key !== "Tab" && e.key !== "Escape") return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      mouthContainer.addEventListener("keydown", trapFocus);
      overlay.onclick = () => {
        closeMouthOptions();
        mouthContainer.removeEventListener("keydown", trapFocus);
      };
    })
  })
};

// ---- CLOSING MOUTH OPTIONS -------------------------------------------
const closeMouthOptions = () => {
  const mouthContainer = document.getElementById(`mouth-options-${currentUser}`);
  overlay.classList.remove("visible");
  mouthContainer.style.display = "none";
}

// ---- ONCLICK COUNTER UPDATE ------------------------------------------
const registerClickZonesEvents = () => {
  clickZones.forEach((zone) => {
    const part = zone.dataset.part;
    let points = defaultPoints[part] || 0;
    zone.addEventListener("click", async (e) => {
      showRipple(e, zone);
      showFloatingScore(e, points);
      // If not in guest mode, sends the relamido to the API:
      if (loggedInUser !== "pixie") {
        try {
          const partId = await getFacePartId(part, playerType);
          const result = await sendRelamido(playerId, partId);
          console.log(`Relamido saved by ${loggedInUser} to ${currentUser}:`, result);
          updateUI(part, points);
        } catch (err) {
          console.error("Failed to send relamido:", err);
          alert("Oops! Your lick wasn’t saved. Try again!");
        }
      } else {
        updateUI(part, points);
      }
    })
  })
};

const updateUI = (part, points) => {
  if (part === "mouth" || part === "mouth (open)") {
    closeMouthOptions();
  }
  const partCell = document.getElementById(`${part}-${currentUser}`);
  if (partCell) {
    const current = parseInt(partCell.textContent) || 0;
    partCell.textContent = current + points;
    clickCounts[currentUser][part] += 1;
    console.log(`${currentUser}: clicks for ${part}: ${clickCounts[currentUser][part]}`);
  }
  totalScores[currentUser] += points;
  document.getElementById(`total-score-${currentUser}`).textContent = totalScores[currentUser];
  srStatus.textContent = `You selected: ${part}, which scores ${points}. Your total score is now ${totalScores[currentUser]}`;
};

// ---- GENERAL KEYBOARD ACCESSIBILITY EVENTS ---------------------------
const registerKeyboardEvents = () => {
  document.body.querySelectorAll('[role="button"]').forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });
}

export default () => {
  registerClickZones();
  registerSelectUserEvent();
  registerOpenMouthEvents();
  registerGoBackEvent();
  registerClickZonesEvents();
  registerKeyboardEvents();
};

