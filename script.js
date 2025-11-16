// ===========================
// 🕹️ LogicLine Game Script
// ===========================

document.addEventListener("DOMContentLoaded", () => {

  // ===========================
  // 🧩 DOM References
  // ===========================
  const grid = document.getElementById("game-grid");
  const scoreDisplay = document.getElementById("score");
  const modal = document.getElementById("modal-overlay");
  const howToBtn = document.getElementById("btn-howto");
  const closeModalBtn = document.getElementById("close-modal");
  const clueButtons = document.querySelectorAll(".clue-btn");
  const clueFeedback = document.getElementById("clue-feedback");
  const keys = document.querySelectorAll(".key");
  const dynamicPanel = document.getElementById("dynamic-panel");
  const leaderboardBtn = document.getElementById("btn-leaderboard");
  const pointsBtn = document.getElementById("btn-points");
  const newGameBtn = document.getElementById("new-game-btn");

  const leaderboardModal = document.getElementById("leaderboard-modal");
  const playerNameInput = document.getElementById("player-name-input");
  const saveNameBtn = document.getElementById("save-name-btn");
  const skipNameBtn = document.getElementById("skip-name-btn");

  const endgameOverlay = document.getElementById("endgame-overlay");
  const endgameTitle = document.getElementById("endgame-title");
  const endgameMessage = document.getElementById("endgame-message");
  const continueBtn = document.getElementById("continue-btn");
  const restartBtn = document.getElementById("restart-btn");

  const dateTimeEl = document.getElementById("date-time");
  const introScreen = document.getElementById("intro-screen");
  const startBtn = document.getElementById("start-btn");

  // Sound toggles
  const introSoundToggle = document.getElementById("sound-toggle");
  const navSoundToggle = document.getElementById("nav-sound-toggle");
  const bgMusic = document.getElementById("bg-music");

  // Mode buttons
  const btnDaily = document.getElementById("btn-daily");
  const btnRandom = document.getElementById("btn-random");



  // ===========================
  // 📅 Daily Puzzle Tracking
  // ===========================
  function hasPlayedToday() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return localStorage.getItem("dailyPlayed") === today;
  }

  function markDailyPlayed() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("dailyPlayed", today);
  }

  // ===========================
  // 🔊 Sound Effects + Music
  // ===========================
  let soundOn = true;

  const sounds = {
    correct: new Audio("assets/sounds/correct.mp3"),
    present: new Audio("assets/sounds/present.mp3"),
    absent: new Audio("assets/sounds/absent.mp3"),
    clue: new Audio("assets/sounds/clue.mp3"),
  };

  function updateSoundButtons() {
    const label = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
    if (introSoundToggle) introSoundToggle.textContent = label;
    if (navSoundToggle) navSoundToggle.textContent = label;
  }

  function toggleSound() {
    soundOn = !soundOn;
    if (soundOn) bgMusic.play(); else bgMusic.pause();
    updateSoundButtons();
  }

  introSoundToggle?.addEventListener("click", toggleSound);
  navSoundToggle?.addEventListener("click", toggleSound);

  // ===========================
  // 📅 Date Label
  // ===========================
  function updateDateLabel() {
    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
    dateTimeEl.textContent = `🗓️ ${today}`;
  }
  updateDateLabel();


  // ===========================
// 📢 Modal Logic for Nav Buttons
// ===========================

// How to Play button
howToBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.classList.add("active");
});

// Leaderboard button
leaderboardBtn.addEventListener("click", () => {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  dynamicPanel.innerHTML = `
    <h2>🏆 Leaderboard</h2>
    <ol>
      ${leaderboard.map((entry, i) =>
        `<li>${i === 0 ? "👑 " : ""}${entry.name}: ${entry.score}</li>`
      ).join("")}
    </ol>
  `;
  dynamicPanel.classList.add("show");
});

// ===========================
// 🏆 Leaderboard Modal Logic
// ===========================
saveNameBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }
  leaderboardModal.classList.add("hidden");
  endgameOverlay.classList.add("hidden"); // hide overlay too if open
  startNewGame();
});

skipNameBtn.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
  endgameOverlay.classList.add("hidden");
  startNewGame();
});

// Points / History button
pointsBtn.addEventListener("click", () => {
  const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
  dynamicPanel.innerHTML = `
    <h2>📜 Game History</h2>
    <ul>
      ${history.map(h => `
        <li>${h.date} — ${h.win ? "✅ Solved" : "❌ Failed"} in ${h.attempts} tries
        <span class="bonus">+${h.scoreEarned}</span> ${h.daily ? "📅 Daily" : "🎲 Random"}</li>
      `).join("")}
    </ul>
  `;
  dynamicPanel.classList.add("show");
});
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("active");
});


  // ===========================
  // 🧠 Word Bank
  // ===========================
  const solutionWords = ["FRAME", "CLOUD", "MUSIC", "LIGHT", "RIVER", "STORM"];
  let validGuesses = [...solutionWords];

  fetch("data/dictionary.txt")
    .then(res => res.text())
    .then(text => {
      const words = text.split(/\r?\n/)
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length === 5);
      validGuesses = [...new Set([...validGuesses, ...words])];
    })
    .catch(() => {
      clueFeedback.textContent = "⚠️ Dictionary failed to load, using defaults.";
    });

  function getRandomWord() {
    const filtered = validGuesses.filter(w => w.length === 5);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function getDailySeed() {
    const today = new Date();
    return today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
  }

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getDailyWord() {
    const filtered = validGuesses.filter(w => w.length === 5);
    const idx = Math.floor(seededRandom(getDailySeed()) * filtered.length);
    return filtered[idx] || getRandomWord();
  }

  // ===========================
  // 🎮 Game State
  // ===========================
  let currentRow = 0;
  let isDailyMode = true;
  let targetWord = getDailyWord().toUpperCase();
  let score = parseInt(localStorage.getItem("score")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;
  let rewardedYellows = new Set();
  let rewardedGreens = new Set();
  let gameOver = false;

  function updateScoreDisplay() {
    scoreDisplay.textContent = score;
    scoreDisplay.classList.add("pulse");
    setTimeout(() => scoreDisplay.classList.remove("pulse"), 300);
    localStorage.setItem("score", score);
    localStorage.setItem("streak", streak);
  }

  function showScoreFloat(amountOrText, color = "#44ff44", anchorEl = scoreDisplay) {
    const float = document.createElement("div");
    float.className = "score-float";
    float.textContent = typeof amountOrText === "number"
      ? (amountOrText > 0 ? `+${amountOrText}` : `${amountOrText}`)
      : amountOrText;
    if (typeof amountOrText !== "number") float.classList.add("streak");
    float.style.color = color;

    const rect = anchorEl.getBoundingClientRect();
    const parentRect = anchorEl.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    float.style.left = rect.left - parentRect.left + rect.width / 2 + "px";
    float.style.top = rect.top - parentRect.top + "px";

    anchorEl.offsetParent?.appendChild(float);
    setTimeout(() => float.remove(), 1000);
  }

  function createEmptyGrid() {
    grid.innerHTML = "";
    for (let row = 0; row < 6; row++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("guess-row");
      for (let col = 0; col < 5; col++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.setAttribute("data-state", "empty");
        rowDiv.appendChild(tile);
      }
      grid.appendChild(rowDiv);
    }
  }

  function startNewGame() {
  if (isDailyMode) {
    if (hasPlayedToday()) {
      // Try to restore yesterday's grid
      if (restoreDailyGridIfPlayed()) return;
      clueFeedback.textContent = "📅 You've already played today's puzzle!";
      gameOver = true; // lock input
      return;          // leave grid untouched
    }
    targetWord = getDailyWord().toUpperCase();
    gameOver = false;  // allow typing for fresh daily
  } else {
    targetWord = getRandomWord().toUpperCase();
    createEmptyGrid(); // random mode always resets
    gameOver = false;  // allow typing
  }

  currentRow = 0;
  updateScoreDisplay();
  clueFeedback.textContent = "";
  newGameBtn.classList.add("hidden");
  restartBtn.classList.remove("attention");
  keys.forEach(key => key.classList.remove("correct", "present", "absent"));
  rewardedYellows.clear();
  rewardedGreens.clear();
}

  // ===========================
  // 🎯 Guess Rendering Logic
  // ===========================
  function renderGuess(guess, rowIndex) {
    const row = document.querySelectorAll(".guess-row")[rowIndex];
    const tiles = row.querySelectorAll(".tile");

    const targetArr = [...targetWord];
    const guessArr = [...guess];
    const counts = {};
    targetArr.forEach(l => counts[l] = (counts[l] || 0) + 1);

        let correctCount = 0;

    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
      const letter = guessArr[i];
      tiles[i].textContent = letter;
      tiles[i].classList.add("flip");
      tiles[i].style.animationDelay = `${i * 80}ms`;

      if (letter === targetArr[i]) {
        tiles[i].setAttribute("data-state", "correct");
        updateKeyboard(letter, "correct");
        sounds.correct?.play();
        counts[letter] -= 1;
        correctCount++;

        if (!rewardedGreens.has(letter)) {
          score += 2;
          rewardedGreens.add(letter);
          showScoreFloat(2, "#44ff44", tiles[i]);
        }
      } else {
        tiles[i].setAttribute("data-state", "absent"); // provisional
      }
    }

    // Second pass: mark present vs absent (respect duplicates)
    for (let i = 0; i < 5; i++) {
      const letter = guessArr[i];
      const state = tiles[i].getAttribute("data-state");
      if (state === "correct") continue;

      if (counts[letter] > 0) {
        tiles[i].setAttribute("data-state", "present");
        updateKeyboard(letter, "present");
        sounds.present?.play();
        counts[letter] -= 1;

        if (!rewardedYellows.has(letter)) {
          score += 1;
          rewardedYellows.add(letter);
          showScoreFloat(1, "#ffff44", tiles[i]);
        }
      } else {
        tiles[i].setAttribute("data-state", "absent");
        updateKeyboard(letter, "absent");
        sounds.absent?.play();
      }
    }

    updateScoreDisplay();

    if (correctCount === 5) {
      // Win
      streak++;
      const bonus = (6 - currentRow) * 2;
      const earned = 5 + bonus;
      score += earned;
      showScoreFloat("🔥 Streak +" + streak, "#ff8800", scoreDisplay);
      showScoreFloat(earned, "#00ffcc", scoreDisplay);
      clueFeedback.textContent = `🎉 Solved in ${currentRow + 1} rows! Bonus +${bonus}`;
      updateScoreDisplay();
      saveGameResult(true, currentRow + 1, earned);

      if (isDailyMode) markDailyPlayed();
      saveDailyGrid();
      leaderboardModal.classList.remove("hidden");
      playerNameInput.value = "";
      playerNameInput.focus();
      markDailyPlayed();
      gameOver = true; // lock input
      showEndgameModal(true, targetWord);

    }
    else if (currentRow === 5) {
      // Loss
      setTimeout(() => {
        streak = 0;
        updateScoreDisplay();
        saveGameResult(false, 6, 0);
        if (isDailyMode) markDailyPlayed();
        saveDailyGrid();
        showEndgameModal(false, targetWord);
      }, 600);
      gameOver = true; // lock input

    }
  }

  // ===========================
// 💾 Save & Restore Daily Grid
// ===========================
function saveDailyGrid() {
  const rows = [];
  document.querySelectorAll(".guess-row").forEach(row => {
    const tiles = Array.from(row.querySelectorAll(".tile")).map(tile => ({
      letter: tile.textContent,
      state: tile.getAttribute("data-state")
    }));
    rows.push(tiles);
  });
  localStorage.setItem("dailyGrid", JSON.stringify(rows));
  localStorage.setItem("dailyDate", new Date().toDateString());
}

function restoreDailyGridIfPlayed() {
  const savedDate = localStorage.getItem("dailyDate");
  const today = new Date().toDateString();

  if (savedDate === today) {
    const rows = JSON.parse(localStorage.getItem("dailyGrid")) || [];
    grid.innerHTML = "";
    rows.forEach(rowData => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("guess-row");
      rowData.forEach(tileData => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.textContent = tileData.letter;
        tile.setAttribute("data-state", tileData.state || "empty");
        rowDiv.appendChild(tile);
      });
      grid.appendChild(rowDiv);
    });
    clueFeedback.textContent = "📅 You've already played today's puzzle!";
    gameOver = true; // lock input
    return true;
  }
  return false;
}

  // ===========================
  // 📝 Save Game Results
  // ===========================
  function saveGameResult(win, attempts, scoreEarned) {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    history.push({
      date: new Date().toLocaleString(),
      win,
      attempts,
      scoreEarned,
      daily: isDailyMode
    });
    localStorage.setItem("gameHistory", JSON.stringify(history));
  }

  // ===========================
  // ⌨️ Keyboard Input
  // ===========================
  function updateKeyboard(letter, state) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key && !key.classList.contains("correct")) {
      key.classList.remove("present", "absent");
      key.classList.add(state);
    }
  }

  function handleKeyInput(key) {
     if (gameOver) return;
    const keyBtn = document.querySelector(`.key[data-key="${key}"]`);
    if (keyBtn) {
      keyBtn.classList.add("pressed");
      setTimeout(() => keyBtn.classList.remove("pressed"), 150);
    }

    const row = document.querySelectorAll(".guess-row")[currentRow];
    if (!row) return;

    const tiles = row.querySelectorAll(".tile");
    const filled = Array.from(tiles).filter(t => t.textContent !== "").length;

    if (key === "Backspace" && filled > 0) {
      tiles[filled - 1].textContent = "";
      tiles[filled - 1].setAttribute("data-state", "empty");
    } else if (key === "Enter" && filled === 5) {
      const guess = Array.from(tiles).map(t => t.textContent).join("");
      if (!validGuesses.includes(guess.toUpperCase())) {
        clueFeedback.textContent = "❌ Not a valid word!";
        clueFeedback.classList.add("shake", "fade");
        setTimeout(() => clueFeedback.classList.remove("shake", "fade"), 600);
        return;
      }
      renderGuess(guess.toUpperCase(), currentRow);
      currentRow++;
    } else if (/^[A-Z]$/.test(key) && filled < 5) {
      tiles[filled].textContent = key;
    }
   
  }


  document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key.toUpperCase();
    if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
      handleKeyInput(
        key === "ENTER" ? "Enter" :
        key === "BACKSPACE" ? "Backspace" :
        key
      );
    }
  });

  keys.forEach(key => {
    key.addEventListener("click", () => {
      handleKeyInput(key.dataset.key);
    });
  });

  // ===========================
// 🎬 Endgame Modal Logic
// ===========================
function showEndgameModal(win, word) {
  if (win) {
    endgameTitle.textContent = "🎉 You Won!";
    endgameMessage.textContent = "Great job, detective!";
    continueBtn.style.display = "inline-block";
    continueBtn.textContent = "Continue";
    restartBtn.style.display = "none";
  } else {
    endgameTitle.textContent = "🕵️ Case Closed";
    endgameMessage.textContent = `The word was: ${word}`;
    continueBtn.style.display = "inline-block";
    continueBtn.textContent = "Continue (20 pts)";
    restartBtn.style.display = "inline-block";
  }


  endgameOverlay.classList.remove("hidden");
}

// Continue button logic
continueBtn.addEventListener("click", () => {
  if (endgameTitle.textContent.includes("You Won")) {
    endgameOverlay.classList.add("hidden");
    startNewGame();
  } else {
    const costToContinue = 20;
    if (score >= costToContinue) {
      score -= costToContinue;
      updateScoreDisplay();
      showScoreFloat(-costToContinue, "#ff4444", scoreDisplay);
      endgameOverlay.classList.add("hidden");
      startNewGame();
    } else {
      score = 0;
      streak = 0;
      updateScoreDisplay();
      showScoreFloat("❌ Streak Reset", "#ff4444", scoreDisplay);
      endgameMessage.textContent = "Not enough points — you lost all your points!";
      restartBtn.classList.add("attention");
    }
  }
});

// Restart button logic
restartBtn.addEventListener("click", () => {
  endgameOverlay.classList.add("hidden");
  score = 0;
  streak = 0;
  updateScoreDisplay();
  startNewGame();
});


  // ===========================
  // 🎬 Intro Screen Logic
  // ===========================
  startBtn.onclick = () => {
    introScreen.classList.add("hidden");
    if (soundOn) bgMusic.play();
    startNewGame();
  };

  document.getElementById("intro-howto")?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("active");
  });

  // ===========================
  // 📅 Mode Toggle (Daily vs Random)
  // ===========================
  function setMode(isDaily) {
    isDailyMode = isDaily;
    btnDaily.classList.toggle("active", isDailyMode);
    btnRandom.classList.toggle("active", !isDailyMode);
    clueFeedback.textContent = isDailyMode
      ? "📅 Daily mode activated"
      : "🎲 Random mode activated";
    startNewGame();
  }


  btnDaily.addEventListener("click", (e) => {
  e.target.blur(); // remove focus so Enter won't re-trigger
  isDailyMode = true;
  startNewGame();
  });


  btnRandom.addEventListener("click", (e) => {
  e.target.blur(); // remove focus
  isDailyMode = false;
  startNewGame();
  });

  btnDaily.addEventListener("click", () => setMode(true));
  btnRandom.addEventListener("click", () => setMode(false));

  // Initialize mode on load
  setMode(true);

  // ===========================
  // 🔁 Game Initialization
  // ===========================
  newGameBtn.addEventListener("click", startNewGame);
  createEmptyGrid();
  updateScoreDisplay();
});


// ===========================
// 📱 Mobile Game Flow Logic
// ===========================

const introScreen = document.getElementById("intro-screen");
const topNav = document.getElementById("top-nav");
const modeSelect = document.getElementById("mode-select");
const gameGrid = document.getElementById("game-grid");
const keyboard = document.getElementById("keyboard");
const newGameBtn = document.getElementById("new-game-btn");
const dailyBtn = document.getElementById("btn-daily");
const randomBtn = document.getElementById("btn-random");

function isMobileView() {
  return window.innerWidth <= 768;
}

// Step 1 → Step 2: Show mode select
document.getElementById("start-btn").addEventListener("click", () => {
  if (!isMobileView()) return;

  introScreen.classList.add("hidden");
  topNav.style.display = "flex";
  modeSelect.style.display = "flex";

  gameGrid.style.display = "none";
  keyboard.style.display = "none";
  newGameBtn.classList.add("hidden");
});

// Step 2 → Step 3: Launch game
function launchGame(mode) {
  if (!isMobileView()) return;

  modeSelect.style.display = "none";
  gameGrid.style.display = "grid";
  keyboard.style.display = "flex";
  newGameBtn.classList.remove("hidden");

  isDailyMode = mode === "daily";
  startNewGame();
}

dailyBtn.addEventListener("click", () => launchGame("daily"));
randomBtn.addEventListener("click", () => launchGame("random"));

// On load: show intro only on mobile
window.addEventListener("DOMContentLoaded", () => {
  if (isMobileView()) {
    introScreen.classList.remove("hidden");
    topNav.style.display = "none";
    modeSelect.style.display = "none";
    gameGrid.style.display = "none";
    keyboard.style.display = "none";
    newGameBtn.classList.add("hidden");
  }



// ===========================
// 🧩 Modal Toggle Logic
// ===========================

// DOM references
const leaderboardModal = document.getElementById("leaderboard-modal");
const dynamicPanel = document.getElementById("dynamic-panel");
const howtoModal = document.getElementById("modal-overlay");

const btnLeaderboard = document.getElementById("btn-leaderboard");
const btnPoints = document.getElementById("btn-points");
const btnHowto = document.getElementById("btn-howto");

const skipNameBtn = document.getElementById("skip-name-btn");
const closeHowtoBtn = document.getElementById("close-modal");

// Show Leaderboard modal
btnLeaderboard.addEventListener("click", () => {
  leaderboardModal.classList.remove("hidden");
});

// Hide Leaderboard modal
skipNameBtn.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
});

// Show Game History (dynamic panel)
btnPoints.addEventListener("click", () => {
  dynamicPanel.classList.remove("hidden");
  dynamicPanel.innerHTML = `
    <h2>Game History</h2>
    <p>Your recent games will appear here.</p>
    <button class="nav-btn" id="close-history">Close</button>
  `;

  // Add close button logic dynamically
  document.getElementById("close-history").addEventListener("click", () => {
    dynamicPanel.classList.add("hidden");
    dynamicPanel.innerHTML = ""; // clean up
  });
});

// Show How to Play modal
btnHowto.addEventListener("click", () => {
  howtoModal.classList.remove("hidden");
});

// Hide How to Play modal
closeHowtoBtn.addEventListener("click", () => {
  howtoModal.classList.add("hidden");
});


 btnLeaderboard.addEventListener("click", () => {
    leaderboardModal.style.display = "flex";
  });

  skipNameBtn.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
  });

  btnPoints.addEventListener("click", () => {
    document.getElementById("history-modal").style.display = "flex";
  });

  document.getElementById("close-history").addEventListener("click", () => {
    document.getElementById("history-modal").style.display = "none";
  });

});
