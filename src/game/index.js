import { defaultPoints } from "./config.js";
import { decodeJWT, getFacePartId, getUserInfo, getUserScore, sendRelamido } from "./services.js";
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

let currentUser = "";
const createdUsers = new Set();
let selectedPlayer = "";
let playerId = null;
let playerType = "";

const userPartsMap = {};
const totalScores = {};
const clickCounts = {};


// ---- CONFIRMS LOGIN, TOKEN EXPIRATION AND LOG OUT LOGIC --------------

const tokenExpired = () => {
  localStorage.removeItem("access_token");
  const box = document.getElementById("expired-token");
  box.showModal();
  box.querySelector(".closeButton").addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

const confirmGameAccess = () => {
  const token = localStorage.getItem("access_token");
  // Redirects to login if there's no token:
  if (!token) {
    window.location.replace('login.html');
    return;
  }
  // Retrieves information from token if any:
  const payload = decodeJWT(token);
  // Handle redirection to login in case of token expiration
  if (!payload || !payload.exp) return tokenExpired();
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpire = (payload.exp - now) * 1000;
  if (timeUntilExpire <= 0) return tokenExpired();
  setTimeout(() => {
    tokenExpired();
  }, timeUntilExpire);
  // Retrieves logged user:
  currentUser = payload.name;
}

confirmGameAccess();

const logoutButton = document.getElementById("logout");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "login.html";
  });
};

// ---- DISPLAYS AVATARS AND OPTIONS DEPENDING ON AUTHENTICATED USER ----
const displayAvatars = async () => {
  for (const img of avatars) {
    const userInfo = await getUserInfo(img.id);
    const score = await getUserScore(userInfo.id);
    const container = document.getElementById(`${img.id}-container`);

    const span = document.createElement("span");
    span.textContent =
      img.id === currentUser ? `Your score: ${score}` : `Current score: ${score}`;
    if (img.id === currentUser) span.style.color = "#e4a434";
    container.appendChild(span);

    if (img.id === currentUser) {
      img.style.opacity = "0.6";
      container.style.backdropFilter = "blur(2px)";
      container.style.webkitBackdropFilter = "blur(2px)";
      img.style.pointerEvents = "none";
      img.tabIndex = -1;
    }
  }
};

displayAvatars();


// ---- DEFINE GAME INIT AND RESET --------------------------------------
const reset = () => {
  if (selectedPlayer) {
    document.getElementById(`face-${selectedPlayer}`).style.display = "none";
    document.getElementById(`score-table-${selectedPlayer}`).style.display = "none";
  }
  selectAvatar.style.display = "block";
  counter.style.display = "none";
  backButtonContainer.style.display = "none";
  selectedPlayer = "";
  playerId = null;
  playerType = "";
};

const init = (player) => {
  srStatus.textContent = `You are playing with ${player}.`;
  selectAvatar.style.display = "none";
  backButtonContainer.style.display = "flex";
  document.getElementById(`face-${player}`).style.display = "block";
  counter.style.display = "block";
  const table = document.getElementById(`score-table-${player}`);
  if (table) {
    table.style.display = "table";
  }
};

// ---- RETRIEVE AND INITIALIZE USERS AND THEIR BODY PARTS --------------
const registerClickZones = () => {
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
const createPlayerTable = (player) => {
  const table = createElement("table", {
    id: `score-table-${player}`,
    className: "score-table",
  });
  table.innerHTML = `
    <thead><tr><th>Body parts</th><th>Points</th></tr></thead>
    <tbody id="score-body-${player}"></tbody>
  `;
  const body = table.querySelector("tbody");
  userPartsMap[player].forEach((part) => {
    const row = createElement("tr");
    row.innerHTML = `
      <td id="${part}">${part.charAt(0).toUpperCase() + part.slice(1)}</td>
      <td id="${part}-${player}">0</td>
    `;
    body.appendChild(row)
  });
  const totalRow = createElement("tr");

  totalRow.innerHTML = `
  <td class="score">Total</td>
  <td id="total-score-${player}" class="score">${totalScores[player]}</td>
`;
  body.appendChild(totalRow);
  return table;
};

const createPlayerScore = async (player) => {
  // Makes sure to create the table only once per user and session (session ends at refresh):
  if (createdUsers.has(player)) { return };
  const table = createPlayerTable(player);
  const scoreContainer = document.getElementById("score-container");
  scoreContainer.append(table);
  createdUsers.add(player);
};


// ---- AVATAR SELECTION ------------------------------------------------
const registerSelectPlayerEvent = () => {
  avatars.forEach((avatar) =>
    avatar.addEventListener("click", async () => {
      selectedPlayer = avatar.id;
      // Accessibility: aria selected on selected avatar:
      avatars.forEach((avatar) =>
        avatar.setAttribute("aria-selected", avatar.id === selectedPlayer ? "true" : "false")
      );
      const player = await getUserInfo(selectedPlayer);
      playerId = player.id;
      playerType = player.type;
      totalScores[selectedPlayer] = await getUserScore(playerId);
      createPlayerScore(selectedPlayer);
      init(selectedPlayer);
    })
  );
};

// ---- GO BACK BUTTON --------------------------------------------------
const registerGoBackEvent = () => {
  backButton.addEventListener("click", () => {
    if (selectedPlayer) {
      srStatus.textContent = `Thank you for playing with Sasha and ${selectedPlayer}! \
      Your current total score is: ${totalScores[selectedPlayer]}.\
      We hope to see you again soon. You will now be redirected to the avatar selection area.`;
      if (!/iPad/i.test(navigator.userAgent)) {
        // 👆 excluding iPad due to compatibility issue with my iPad and the video file
        let src;
        if (selectedPlayer === "pixie") {
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
          innerHTML: `<h1> ${selectedPlayer.charAt(0).toUpperCase() + selectedPlayer.slice(1)
            } survived the slurp attack!<h1><h2>Total score: ${totalScores[selectedPlayer]}</h2>`,
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
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log(`Bye bye ${selectedPlayer}!`);
    if (totalScores[selectedPlayer] > 0) {
      console.log(`Current score: ${totalScores[selectedPlayer]}!`);
      console.log(`Licking history:`);
      console.log(clickCounts[selectedPlayer]);
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
        `mouth-options-${selectedPlayer}`
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
  const mouthContainer = document.getElementById(`mouth-options-${selectedPlayer}`);
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
      try {
        const partId = await getFacePartId(part, playerType);
        const result = await sendRelamido(playerId, partId);
        console.log(`Relamido saved by ${currentUser} to ${selectedPlayer}:`, result);
        updateUI(part, points);
      } catch (err) {
        console.error("Failed to send relamido:", err);
        alert("Oops! Your lick wasn’t saved. Try again!");
      }
    })
  })
};

const updateUI = (part, points) => {
  if (part === "mouth" || part === "mouth (open)") {
    closeMouthOptions();
  }
  const partCell = document.getElementById(`${part}-${selectedPlayer}`);
  if (partCell) {
    const current = parseInt(partCell.textContent) || 0;
    partCell.textContent = current + points;
    clickCounts[selectedPlayer][part] += 1;
    console.log(`${selectedPlayer}: clicks for ${part}: ${clickCounts[selectedPlayer][part]}`);
  }
  totalScores[selectedPlayer] += points;
  document.getElementById(`total-score-${selectedPlayer}`).textContent = totalScores[selectedPlayer];
  srStatus.textContent = `You selected: ${part}, which scores ${points}. Your total score is now ${totalScores[selectedPlayer]}`;
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
  registerSelectPlayerEvent();
  registerOpenMouthEvents();
  registerGoBackEvent();
  registerClickZonesEvents();
  registerKeyboardEvents();
};

