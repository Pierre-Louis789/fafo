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
  const wordLengthSelector = document.getElementById("word-length");
  const clueButtons = document.querySelectorAll(".clue-btn");
  const clueFeedback = document.getElementById("clue-feedback");
  const keys = document.querySelectorAll(".key");
  const dynamicPanel = document.getElementById("dynamic-panel");
  const leaderboardBtn = document.getElementById("btn-leaderboard");
  const pointsBtn = document.getElementById("btn-points");
  const newGameBtn = document.getElementById("new-game-btn");

  // Leaderboard Modal
  const leaderboardModal = document.getElementById("leaderboard-modal");
  const playerNameInput = document.getElementById("player-name-input");
  const saveNameBtn = document.getElementById("save-name-btn");
  const skipNameBtn = document.getElementById("skip-name-btn");

  // Endgame Modal
  const endgameOverlay = document.getElementById("endgame-overlay");
  const endgameTitle = document.getElementById("endgame-title");
  const endgameMessage = document.getElementById("endgame-message");
  const playAgainBtn = document.getElementById("play-again-btn");
  const continueBtn = document.getElementById("continue-btn");
  const restartBtn = document.getElementById("restart-btn");

  // ===========================
  // 🔊 Sound Effects
  // ===========================
  const sounds = {
    correct: new Audio("assets/sounds/correct.mp3"),
    present: new Audio("assets/sounds/present.mp3"),
    absent: new Audio("assets/sounds/absent.mp3"),
    clue: new Audio("assets/sounds/clue.mp3")
  };

  // ===========================
  // 🧠 Word Bank System
  // ===========================
  const solutionWords = ["FRAME", "CLOUD", "MUSIC", "LIGHT", "RIVER", "STORM"];
  let validGuesses = [...solutionWords];

  fetch("data/dictionary.txt")
    .then(res => res.text())
    .then(text => {
      const words = text
        .split(/\r?\n/)
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length >= 4 && w.length <= 6);
      validGuesses = [...new Set([...validGuesses, ...words])];
    });

  function getRandomWord(length) {
    const filtered = solutionWords.filter(word => word.length === length);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function isValidGuess(guess) {
    return guess.length === wordLength && validGuesses.includes(guess.toUpperCase());
  }

  // ===========================
  // 🎮 Game State
  // ===========================
  let currentRow = 0;
  let wordLength = parseInt(wordLengthSelector.value);
  let targetWord = getRandomWord(wordLength).toUpperCase();
  let score = parseInt(localStorage.getItem("score")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;
  let rewardedYellows = new Set();
  let rewardedGreens = new Set();

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

  // If it's a number, format with +/-
  if (typeof amountOrText === "number") {
    float.classList.add("streak");
    float.textContent = (amountOrText > 0 ? `+${amountOrText}` : `${amountOrText}`);
  } else {
    float.textContent = amountOrText; // custom text like "🔥 Streak +1"
  }


  // Position relative to the anchor element
  const rect = anchorEl.getBoundingClientRect();
  const parentRect = anchorEl.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };

  float.style.left = rect.left - parentRect.left + rect.width / 2 + "px";
  float.style.top = rect.top - parentRect.top + "px";

  anchorEl.offsetParent?.appendChild(float);

  setTimeout(() => float.remove(), 1000);
}

  function startNewGame() {
    wordLength = parseInt(wordLengthSelector.value) || 5;
    targetWord = getDailyWord(wordLength).toUpperCase();
    currentRow = 0;
    updateScoreDisplay();
    createEmptyGrid();
    clueFeedback.textContent = "";
    newGameBtn.classList.add("hidden");

    keys.forEach(key => key.classList.remove("correct", "present", "absent"));
    rewardedYellows.clear();
    rewardedGreens.clear();
  }

  // ===========================
  // 🧱 Grid Rendering
  // ===========================
  function createEmptyGrid() {
    grid.innerHTML = "";
    for (let row = 0; row < 6; row++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("guess-row");

      for (let col = 0; col < wordLength; col++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.setAttribute("data-state", "empty");
        rowDiv.appendChild(tile);
      }

      grid.appendChild(rowDiv);
    }
  }

  // ===========================
  // 🎯 Render Guess + Scoring
  // ===========================
  function renderGuess(guess, rowIndex) {
    const row = document.querySelectorAll(".guess-row")[rowIndex];
    const tiles = row.querySelectorAll(".tile");

    let correctCount = 0;

    // Tile animation and scoring 
    for (let i = 0; i < wordLength; i++) {
      const letter = guess[i];
      tiles[i].textContent = letter;
      tiles[i].classList.add("flip");
      tiles[i].style.animationDelay = `${i * 100}ms`;

      let state = "absent";

      if (letter === targetWord[i]) {
        state = "correct";
        if (!rewardedGreens.has(letter)) {
          score += 2;
          rewardedGreens.add(letter);
          showScoreFloat(2, "#44ff44", tiles[i]); // green +2
        }
        correctCount++;
      } 
      else if (targetWord.includes(letter)) {
        state = "present";
        if (!rewardedYellows.has(letter)) {
          score += 1;
          rewardedYellows.add(letter);
          showScoreFloat(1, "#ffff44", tiles[i]); // yellow +1
        }
      }

      tiles[i].setAttribute("data-state", state);
      updateKeyboard(letter, state);
      sounds[state]?.play();
    }

    updateScoreDisplay();

    // --- Win condition ---
    if (correctCount === wordLength) {
      streak++;

    // 🎇 Show streak float
    showScoreFloat("🔥 Streak +" + streak, "#ff8800", scoreDisplay);


      // Calculate score with bonus

      const bonus = (6 - currentRow) * 2; // bonus points for fewer attempts
      const earned = 5 + bonus;
      score += earned;

      showScoreFloat(earned, "#00ffcc", scoreDisplay);


      clueFeedback.textContent = `🎉 Solved in ${currentRow + 1} rows! Bonus +${bonus}`;
      updateScoreDisplay();

      saveGameResult(true, currentRow + 1, earned);

      leaderboardModal.classList.remove("hidden");
      playerNameInput.value = "";
      playerNameInput.focus();
    }

    // --- Lose condition ---
    else if (currentRow === 5) {
  setTimeout(() => {
    streak = 0; // reset streak on loss
    updateScoreDisplay();
    saveGameResult(false, 6, 0);
    showEndgameModal(false, targetWord);
  }, 600);
}
  }

  // ===========================
  // 🎹 Keyboard Logic
  // ===========================
  function updateKeyboard(letter, state) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key && !key.classList.contains("correct")) {
      key.classList.remove("present", "absent");
      key.classList.add(state);
    }
  }

  function handleKeyInput(key) {
    const row = document.querySelectorAll(".guess-row")[currentRow];
    if (!row) return;

    const tiles = row.querySelectorAll(".tile");
    const filled = Array.from(tiles).filter(t => t.textContent !== "").length;

    if (key === "Backspace" && filled > 0) {
      tiles[filled - 1].textContent = "";
      tiles[filled - 1].setAttribute("data-state", "empty");
    } else if (key === "Enter" && filled === wordLength) {
      const guess = Array.from(tiles).map(t => t.textContent).join("");
      if (!isValidGuess(guess)) {
        clueFeedback.textContent = "❌ Not a valid word!";
        clueFeedback.classList.add("shake");
        setTimeout(() => clueFeedback.classList.remove("shake"), 600);
        return;
      }
      renderGuess(guess, currentRow);
      currentRow++;
    } else if (/^[A-Z]$/.test(key) && filled < wordLength) {
      tiles[filled].textContent = key;
    }
  }

  document.addEventListener("keydown", (e) => {
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
  // 📢 Modal Logic (How to Play)
  // ===========================
  if (modal && howToBtn && closeModalBtn) {
    howToBtn.onclick = () => modal.classList.add("active");
    closeModalBtn.onclick = () => modal.classList.remove("active");

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
      }
      if (e.key === "Enter" && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
      }
    });
  }

  // ===========================
  // 🏆 Leaderboard System
  // ===========================
  function saveToLeaderboard(name, score) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 10)));
  }

  leaderboardBtn.onclick = () => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    dynamicPanel.innerHTML = `
      <h2>🏆 Leaderboard</h2>
      <ol>
        ${leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join("")}
      </ol>
    `;
    dynamicPanel.classList.add("show");
  };

  // ===========================
  // 📝 Leaderboard Modal Logic
  // ===========================
  saveNameBtn.onclick = () => {
    const name = playerNameInput.value.trim();
    if (name) saveToLeaderboard(name, score);
    leaderboardModal.classList.add("hidden");
    showEndgameModal(true, targetWord);
  };

  skipNameBtn.onclick = () => {
    leaderboardModal.classList.add("hidden");
    showEndgameModal(true, targetWord);
  };

  // ===========================
  // 🌞 Daily Word Logic
  // ===========================
  function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  }

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getDailyWord(length) {
    const filtered = solutionWords.filter(w => w.length === length);
    const seed = getDailySeed();
    const index = Math.floor(seededRandom(seed) * filtered.length);
    return filtered[index];
  }

  // ===========================
  // 📊 Game History Logging
  // ===========================
  function saveGameResult(win, attempts, scoreEarned) {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    history.push({
      date: new Date().toLocaleDateString(),
      win,
      attempts,
      scoreEarned
    });
    localStorage.setItem("gameHistory", JSON.stringify(history));
  }

  pointsBtn.onclick = () => {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    dynamicPanel.innerHTML = `
      <h2>📜 Game History</h2>
      <ul>
        ${history.map(h => `
          <li>${h.date} — ${h.win ? "✅ Solved" : "❌ Failed"} in ${h.attempts} tries 
          <span class="bonus">+${h.scoreEarned}</span></li>
        `).join("")}
      </ul>
    `;
    dynamicPanel.classList.add("show");
  };

  // ===========================
  // 💡 Clue Exchange
  // ===========================
  clueButtons.forEach(button => {
    button.addEventListener("click", () => {
      sounds.clue.play();
      const cost = parseInt(button.dataset.cost);
      const type = button.dataset.type;

      if (score < cost) {
        clueFeedback.textContent = "Not enough points!";
        return;
      }

      score -= cost;
      updateScoreDisplay();

      let revealed = "";

      if (type === "reveal-position") {
        const unrevealed = [...targetWord].map((char, i) => ({ char, i }))
          .filter(({ char, i }) => {
            const rows = document.querySelectorAll(".guess-row");
            return ![...rows].some(r => r.querySelectorAll(".tile")[i]?.textContent === char);
          });

        if (unrevealed.length > 0) {
          const { char, i } = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          revealed = `Letter at position ${i + 1}: ${char}`;
        } else {
          revealed = "No new letters left to reveal!";
        }

      } else if (type === "reveal-random") {
        const randomChar = targetWord[Math.floor(Math.random() * targetWord.length)];
        revealed = `Random letter: ${randomChar}`;

      } else if (type === "reveal-vowel") {
        const vowels = ["A", "E", "I", "O", "U"];
        const found = [...targetWord].filter(c => vowels.includes(c));
        revealed = found.length > 0
          ? `Vowel in word: ${found[Math.floor(Math.random() * found.length)]}`
          : "No vowels in this word!";
      }

      clueFeedback.textContent = revealed || "No clue available.";
    });
  });

  // ===========================
// 🎬 Endgame Modal Logic
// ===========================
function showEndgameModal(win, word) {
  if (win) {
    endgameTitle.textContent = "🎉 You Won!";
    endgameMessage.textContent = "Great job, detective!";
    continueBtn.style.display = "inline-block";   // free continue
    continueBtn.textContent = "Continue";         // label makes sense
    restartBtn.style.display = "none";            // no restart needed
  } else {
    endgameTitle.textContent = "🕵️ Case Closed";
    endgameMessage.textContent = `The word was: ${word}`;
    continueBtn.style.display = "inline-block";   // paid continue
    continueBtn.textContent = "Continue (20 pts)";
    restartBtn.style.display = "inline-block";    // restart fresh
  }
  endgameOverlay.classList.remove("hidden");
}

// 🕹️ Continue button logic
continueBtn.addEventListener("click", () => {
  if (endgameTitle.textContent.includes("You Won")) {
    // ✅ Free continue after a win
    endgameOverlay.classList.add("hidden");
    startNewGame(); // streak and score carry on
  } else {
    // 🕹️ Paid continue after a loss
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
    }
  }
});

// 🔁 Restart button: always resets everything
restartBtn.addEventListener("click", () => {
  endgameOverlay.classList.add("hidden");
  score = 0;          // reset points
  streak = 0;         // reset streak
  updateScoreDisplay();
  startNewGame();     // start fresh grid + word
});

// ===========================
// 🔁 Game Initialization
// ===========================
newGameBtn.addEventListener("click", startNewGame);
wordLengthSelector.addEventListener("change", startNewGame);
createEmptyGrid();
updateScoreDisplay();
});