// ===========================
// 🕹️ FAFO Game Script
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // 🧩 DOM References
  // ===========================
  const grid = document.getElementById("game-grid");
  const scoreDisplay = document.getElementById("score");
  const keys = document.querySelectorAll(".key");

  // ===========================
  // 📢 Modal References
  // ===========================

  //History 
  const historyOverlay = document.getElementById("history-overlay");
  const historyContent = document.getElementById("history-content");
  const closeHistory = document.getElementById("close-history");
  const btnPoints = document.getElementById("btn-points");
  // Stats
  const closeStats = document.getElementById("close-stats");
  const btnStats = document.getElementById("btn-stats");
  const statsOverlay = document.getElementById("stats-overlay");
  const statsContent = document.getElementById("stats-content");
  // How to Play modal
  const btnHowto = document.getElementById("btn-howto");
  const howtoScreen = document.getElementById("howto-screen");
  const closeHowtoScreen = document.getElementById("close-howto-screen")
  // Clues (desktop + mobile)
  const clueButtons = document.querySelectorAll(".clue-btn");
  const clueFeedbackMobile = document.getElementById("clue-feedback-mobile");
  const clueFeedbackDesktop = document.getElementById("clue-feedback-desktop");
  const cluePopup = document.getElementById("clue-popup");
  const btnCluePopup = document.getElementById("btn-clue-popup");
  const closeCluePopup = document.getElementById("close-clue-popup");
  const clueOpen = cluePopup && cluePopup.classList.contains("active");

  // Name input 
  const nameInput = document.getElementById("player-name-input");

  // Score panel
  const scorePanel = document.getElementById("score-panel");

  // Endgame overlay
  const endgameOverlay = document.getElementById("endgame-overlay");
  const endgameTitle = document.getElementById("endgame-title");
  const endgameMessage = document.getElementById("endgame-message");
  const continueBtn = document.getElementById("continue-btn");
  const restartBtn = document.getElementById("restart-btn");

  // Layout / nav
  const dateTimeEl = document.getElementById("date-time");
  const introScreen = document.getElementById("intro-screen");
  const startBtn = document.getElementById("start-btn");
  const topNav = document.getElementById("top-nav");
  const keyboard = document.getElementById("keyboard");

  // Mode buttons
  const btnDaily = document.getElementById("btn-daily");
  const btnRandom = document.getElementById("btn-random");

  // Sound
  const introSoundToggle = document.getElementById("sound-toggle");
  const navSoundToggle = document.getElementById("nav-sound-toggle");
  const bgMusic = document.getElementById("bg-music");

  // ===========================
  // 📅 Date Label
  // ===========================
  function updateDateLabel() {
    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
    if (dateTimeEl) dateTimeEl.textContent = `🗓️ ${today}`;
  }
  updateDateLabel();

  // ===========================
  // 🔊 Sound Effects + Music
  // ===========================
  let soundOn = true;
  const sounds = {
    correct: new Audio("assets/sounds/correct.mp3"),
    present: new Audio("assets/sounds/present.mp3"),
    clue: new Audio("assets/sounds/clue.mp3"),
  };
  function updateSoundButtons() {
    const label = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
    if (introSoundToggle) introSoundToggle.textContent = label;
    if (navSoundToggle) navSoundToggle.textContent = label;
  }
  function toggleSound() {
    soundOn = !soundOn;
    if (bgMusic) {
      try { if (soundOn) bgMusic.play(); else bgMusic.pause(); } catch {} // ignore autoplay errors
    }
    updateSoundButtons();
  }
  if (introSoundToggle) introSoundToggle.addEventListener("click", toggleSound);
  if (navSoundToggle) navSoundToggle.addEventListener("click", toggleSound);

  // ===========================
  // 📅 Daily Puzzle Tracking
  // ===========================
  function hasPlayedToday() {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem("dailyPlayed") === today;
  }
  function markDailyPlayed() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("dailyPlayed", today);
  }

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
      showClue("⚠️ Dictionary failed to load, using defaults.");
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
  let bestStreak = parseInt(localStorage.getItem("bestStreak") || "0", 10);
  const rewardedYellows = new Set();
  const rewardedGreens = new Set();
  let gameOver = false;

  function updateScoreDisplay() {
    const mobileScore = document.getElementById("mobile-score");
    if (mobileScore) mobileScore.textContent = `Score: ${score}`;

    if (scoreDisplay) {
      scoreDisplay.textContent = score;
      scoreDisplay.classList.add("pulse");
      setTimeout(() => scoreDisplay.classList.remove("pulse"), 300);
    }

    localStorage.setItem("score", score);
    localStorage.setItem("streak", streak);

    if (scorePanel) scorePanel.textContent = `Score: ${score}`;
  }

  function showScoreFloat(amountOrText, color = "#44ff44", anchorEl = scoreDisplay) {
    if (!anchorEl) return;
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
    if (!grid) return;
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

  // ===========================
  // 🔁 New Game
  // ===========================
  function startNewGame() {
    if (isDailyMode) {
      if (hasPlayedToday()) {
        if (restoreDailyGridIfPlayed()) return;
        showClue("📅 You've already played today's puzzle!");
        gameOver = true;
        return;
      }
      targetWord = getDailyWord().toUpperCase();
      gameOver = false;
      createEmptyGrid();
    } else {
      targetWord = getRandomWord().toUpperCase();
      createEmptyGrid();
      gameOver = false;
    }

    currentRow = 0;
    updateScoreDisplay();
    showClue("");
    if (restartBtn) restartBtn.classList.remove("attention");
    keys.forEach(key => key.classList.remove("correct", "present", "absent"));
    rewardedYellows.clear();
    rewardedGreens.clear();
  }

  // ===========================
  // 🎯 Guess Rendering Logic
  // ===========================
  function renderGuess(guess, rowIndex) {
    const row = document.querySelectorAll(".guess-row")[rowIndex];
    if (!row) return;
    const tiles = row.querySelectorAll(".tile");

    const targetArr = [...targetWord];
    const guessArr = [...guess];
    const counts = {};
    targetArr.forEach(l => counts[l] = (counts[l] || 0) + 1);

    let correctCount = 0;

    // First pass
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
        tiles[i].setAttribute("data-state", "absent");
      }
    }

    // Second pass
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
      showClue(`🎉 Solved in ${currentRow + 1} rows! Bonus +${bonus}`);

      recordGameResult(targetWord, true, earned, currentRow + 1);


      if (isDailyMode) {
        markDailyPlayed();
        saveDailyGrid();
      }

      gameOver = true;
      showEndgameModal(true, targetWord);
    }
    else if (currentRow === 5) {
      // Loss
      setTimeout(() => {
        streak = 0;
        updateScoreDisplay();
        recordGameResult(targetWord, false, 0, 6);

        if (isDailyMode) {
          markDailyPlayed();
          saveDailyGrid();
        }

        showEndgameModal(false, targetWord);
      }, 600);
      gameOver = true;
    }
  }

// ===========================
// 📊 Player Data & Results
// ===========================

// Load History
let history = JSON.parse(localStorage.getItem("history")) || [];
// Save result after each game
function recordGameResult(word, win, points, attempts, playerName = "Anonymous") {
  // Add to history
  history.push({
    word,
    result: win ? "Win" : "Loss",
    attempts,
    points,
    date: new Date().toLocaleString(),
    mode: isDailyMode ? "Daily" : "Random"
  });

  // Trim history
  if (history.length > 1000) {
    history = history.slice(-1000);
  }

  if (isDailyMode) {
    if (win) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      localStorage.setItem("bestStreak", bestStreak);
      score += points;

      if (playerName !== "Anonymous") {
        localStorage.setItem("playerName", playerName);
      }
    } else {
      streak = 0;
    }
  }

  // Update score 
  if (win) {
    score += points;
  }

  // Save history and update score display
  localStorage.setItem("history", JSON.stringify(history));
  updateScoreDisplay();
}

// ===========================
// 📜 History Update
// ===========================

function updateHistory() {
  if (!historyContent) return;

  let arr = JSON.parse(localStorage.getItem("history")) || [];
  let recent = arr.slice(-5); // last 5 games only

  historyContent.innerHTML = arr.length === 0
    ? "<p>No games played yet.</p>"
    : recent.map(game => `
        <div class="history-card ${game.result === "Win" ? "win" : "loss"}">
          <h3>${game.result === "Win" ? "✅ Win" : "❌ Loss"}</h3>
          <p>Word: ${game.word} • Game Attempts: ${game.attempts} • Points: ${game.points} • Mode: ${game.mode}</p>
          <span class="date">${game.date}</span>
        </div>
      `).join("");
}

  // ===========================
// 🏆 Open/Close Modal buttons
// ===========================
// How to Play modal
if (btnHowto && howtoScreen) {
  btnHowto.onclick = () => {
  howtoScreen.classList.remove("hidden");
  introScreen.classList.add("hidden");
  topNav.classList.add("hidden");
};
}

if (closeHowtoScreen && howtoScreen) {
  closeHowtoScreen.onclick = () => {
  howtoScreen.classList.add("hidden");
  topNav.classList.remove("hidden");
};
}

// History modal
if (btnPoints) {
  btnPoints.onclick = () => {
    updateHistory();
    historyOverlay.classList.remove("hidden");
    historyOverlay.classList.add("active");
  };
}

// Stats modal
if (btnStats) {
  btnStats.addEventListener("click", () => {
    updateStatsModal();
    if (statsOverlay) {
      statsOverlay.classList.remove("hidden");
      statsOverlay.classList.add("active");
    }
  });
}

if (closeStats) {
  closeStats.addEventListener("click", () => {
    if (statsOverlay) {
      statsOverlay.classList.add("hidden");
      statsOverlay.classList.remove("active");
    }
  });
}
// ===========================
// ✨ Close modals by clicking outside
// ===========================

// Generic helper
function enableOverlayClose(overlay) {
  if (!overlay) return;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
      overlay.classList.remove("active");
    }
  });
}

// Apply to overlays
enableOverlayClose(historyOverlay);
enableOverlayClose(statsOverlay);
enableOverlayClose(howtoScreen);



// ===========================
// 📊 Stats Modal
// ===========================

// Guard checks with debug logs
if (!btnStats) console.warn("Stats button #btn-stats not found in DOM");
if (!statsOverlay) console.warn("Stats overlay #stats-overlay not found in DOM");
if (!statsContent) console.warn("Stats content #stats-content not found in DOM");
if (!closeStats) console.warn("Close stats button #close-stats not found in DOM");



function updateStatsModal() {
  const arr = JSON.parse(localStorage.getItem("history")) || [];

  const gamesPlayed = arr.length;
  const wins = arr.filter(g => g.result === "Win").length;
  const winPercent = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  // Current streak (from the end)
  let currentStreak = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].result === "Win") currentStreak++;
    else break;
  }

  // Best streak (longest run)
  let bestStreakCalc = 0;
  let tempStreak = 0;
  arr.forEach(g => {
    if (g.result === "Win") {
      tempStreak++;
      bestStreakCalc = Math.max(bestStreakCalc, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Guess distribution 1–6
  const distribution = [0, 0, 0, 0, 0, 0];
  arr.forEach(g => {
    if (g.result === "Win" && g.attempts >= 1 && g.attempts <= 6) {
      distribution[g.attempts - 1]++;
    }
  });

  // Render proportional bars into statsContent
  const maxCount = Math.max(...distribution, 1);
  if (statsContent) {
    statsContent.innerHTML = `
  <div class="stats-header">
    <h2>📊 Your Stats</h2>
  </div>

  <div class="stats-metrics">
    <div class="metric"><span class="label">Played</span><span class="value">${gamesPlayed}</span></div>
    <div class="metric"><span class="label">Win %</span><span class="value">${winPercent}</span></div>
    <div class="metric"><span class="label">Current Streak</span><span class="value">${currentStreak}</span></div>
    <div class="metric"><span class="label">Best Streak</span><span class="value">${bestStreakCalc}</span></div>
  </div>

  <h3 class="distribution-title">Guess Distribution</h3>
  <div class="guess-distribution">
    ${distribution.map((count, i) => {
      const percent = Math.round((count / maxCount) * 100);
      return `
        <div class="guess-row">
          <span class="guess-label">${i + 1}</span>
          <div class="guess-bar">
            <div class="bar-fill" style="width:${percent}%">
              ${count}
            </div>
          </div>
        </div>
      `;
    }).join("")}
  </div>
`;
  } else {
    console.warn("Stats content #stats-content not found in DOM");
  }

  if (statsOverlay) {
    statsOverlay.classList.remove("hidden");
    statsOverlay.classList.add("active");
  }
}

// ===========================
// 📊 Stats Modal Button
// ===========================
if (btnStats) {
  btnStats.onclick = () => {
    updateStatsModal();
  };
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
    if (!grid) return false;

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

    showClue("📅 You've already played today's puzzle!");
    gameOver = true;
    return true;
  }

  return false;
}

  // ===========================
// 🧾 Save Game Result (Daily or Random)
// ===========================

function saveGameResult(win, attempts, scoreEarned) {
  const historyArr = JSON.parse(localStorage.getItem("gameHistory")) || [];

  historyArr.push({
    date: new Date().toLocaleString(),
    win,
    attempts,
    scoreEarned,
    daily: isDailyMode
  });

  const trimmed = historyArr.slice(-5);
  localStorage.setItem("gameHistory", JSON.stringify(trimmed));
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
        showClue("❌ Not a valid word!");
        const targetFB = isMobileView() ? clueFeedbackMobile : clueFeedbackDesktop;
        if (targetFB) {
          targetFB.classList.add("shake");
          setTimeout(() => targetFB.classList.remove("shake"), 600);
        }
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
  // 📢 Modal Logic
  // ===========================

  if (btnPoints && historyOverlay) {
    btnPoints.addEventListener("click", () => {
      historyOverlay.classList.remove("hidden");
      historyOverlay.classList.add("active");
    });
  }
  if (closeHistory && historyOverlay) {
    closeHistory.addEventListener("click", () => {
      historyOverlay.classList.remove("active");
      historyOverlay.classList.add("hidden");
    });
  }
  if (historyOverlay) {
    historyOverlay.addEventListener("click", e => {
      if (e.target === historyOverlay) {
        historyOverlay.classList.remove("active");
        historyOverlay.classList.add("hidden");
      }
    });
  }
  

   // ===========================
  // 🎬 Endgame Modal Logic
  // ===========================
  function showEndgameModal(win, word) {  

  const nameInput = document.getElementById("player-name-input");

  if (win) {
    endgameTitle.textContent = "🎉 You Won!";
    endgameMessage.textContent = "Legend !";
    continueBtn.style.display = "inline-block";
    continueBtn.textContent = "Continue";
    restartBtn.style.display = "none";

    if (nameInput) {
  nameInput.style.display = "block";
  const storedName = localStorage.getItem("playerName");
  if (storedName) nameInput.value = storedName;
  }
  } else {
    endgameTitle.textContent = "👎 You Failed";
    endgameMessage.textContent = `The word was: ${word}`;
    restartBtn.style.display = "inline-block"; 
    restartBtn.textContent = "Try Again";


    if (!isDailyMode) {
      // random mode
      continueBtn.style.display = "none";
      continueBtn.textContent = "Try Again";

     
    } else {
      // daily mode
     continueBtn.style.display = "inline-block";
     continueBtn.textContent = "Come back Tomorrow";
    }


    if (nameInput) nameInput.style.display = "none";
  }

  endgameOverlay.classList.remove("hidden");
}

// ===========================
// 🎬 Endgame Buttons
// ===========================
continueBtn.addEventListener("click", () => {
  endgameOverlay.classList.add("hidden");
  startNewGame();
});


restartBtn.addEventListener("click", () => {
  endgameOverlay.classList.add("hidden");
  score = 0;
  streak = 0;
  updateScoreDisplay();
  startNewGame();
});


  // ===========================
  // 🕵️ Clue Purchase Logic
  // ===========================
  // Popup open/close
  if (btnCluePopup && cluePopup) {
    btnCluePopup.addEventListener("click", () => {
      cluePopup.classList.remove("hidden");
      cluePopup.classList.add("active");
    });
  }
  if (closeCluePopup && cluePopup) {
    closeCluePopup.addEventListener("click", () => {
      cluePopup.classList.remove("active");
      cluePopup.classList.add("hidden");

      const kb = document.getElementById("keyboard");
      if (kb) kb.focus();

    });
  }

  // Prevent Enter key from submitting clue popup form
  document.addEventListener("keydown", (e) => {
  const clueOpen = cluePopup && cluePopup.classList.contains("active");
  const isClueButton = e.target.classList.contains("clue-btn");

  if (e.key === "Enter" && clueOpen && isClueButton) {
    e.preventDefault(); // block Enter only when clue popup is active and focused on a clue button
  }
});

  // View helper
  function isMobileView() {
    return window.innerWidth <= 768;
  }

  // Feedback router
  function showClue(message,autoClear=false) {
    const targetFB = isMobileView() ? clueFeedbackMobile : clueFeedbackDesktop;
    if (!targetFB) return;
    
    targetFB.textContent = message;

    // Auto-clear only for error messages
  if (autoClear) {
    setTimeout(() => {
      if (targetFB.textContent === message) {
        targetFB.textContent = "";
      }
    }, 2000); // disappears after 2s
  }
}


  // 🕵️ Clue Button Logic

clueButtons.forEach(btn => {
  btn.addEventListener("mouseup", () => btn.blur());


  btn.addEventListener("click", () => {
    const cost = parseInt(btn.dataset.cost, 10);
    const type = btn.dataset.type;

    if (score < cost) {
      showClue("❌ Not enough points!", true);
      const targetFB = isMobileView() ? clueFeedbackMobile : clueFeedbackDesktop;
      if (targetFB) {
        targetFB.classList.add("shake");
        setTimeout(() => targetFB.classList.remove("shake"), 600);
      }
      return;
    }
   // Scan grid for confirmed letters
    const confirmed = new Set();
    document.querySelectorAll(".guess-row").forEach(row => {
      row.querySelectorAll(".tile").forEach((tile, i) => {
        if (tile.classList.contains("correct")) {
          confirmed.add(i);
        }
      });
    });



    score -= cost;
    updateScoreDisplay();
    showScoreFloat(-cost, "#ff4444", scoreDisplay);
    sounds.clue?.play();

    let message = "";

    if (type === "reveal-position") {
      const randIndex = Math.floor(Math.random() * targetWord.length);
      message = `Position ${randIndex + 1}: ${targetWord[randIndex]}`;
    } else if (type === "reveal-first") {
      message = `First letter: ${targetWord[0]}`;
    } else if (type === "reveal-last") {
      message = `Last letter: ${targetWord[targetWord.length - 1]}`;
    } else if (type === "reveal-random") {
      const unrevealed = [];
      for (let i = 0; i < targetWord.length; i++) {
        if (!confirmed.has(i)) {
          unrevealed.push(i);
        }
      }

      if (unrevealed.length === 0) {
        message = "✅ All letters already revealed!";
      } else {
        const r = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        message = `Random letter: ${targetWord[r]} (pos ${r + 1})`;
      }
    }

    showClue(message);

    // 🔑 remove focus from the clue button
  btn.blur();

  // ✅ move focus to a safe element
  const kb = document.getElementById("keyboard");
  if (kb) {
    kb.focus();
  } else {
    document.getElementById("focus-dummy").focus();
  }
});
});


  // ===========================
  // 📅 Mode Toggle (Daily vs Random)
  // ===========================

  function setMode(isDaily) {
    isDailyMode = isDaily;

    // Toggle active button styles
  if (btnDaily) btnDaily.classList.toggle("active", isDailyMode);
  if (btnRandom) btnRandom.classList.toggle("active", !isDailyMode);

  // Show mode message
    showClue(isDailyMode ? "📅 Daily mode activated" : "🎲 Random mode activated");
    startNewGame();
  }

  // Mode toggle buttons
if (btnDaily) {
  btnDaily.addEventListener("click", e => {
    e.target.blur();
    setMode(true);
  });
}
if (btnRandom) {
  btnRandom.addEventListener("click", e => {
    e.target.blur();
    setMode(false);
  });
}


  // Intro → launch selected mode
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      grid.style.display = "grid";
      keyboard.style.display = "flex";
      startNewGame();
      introScreen.classList.add("hidden");
      topNav.classList.remove("hidden");
    });
  }

  // Initial mode on load
  setMode(true);
});