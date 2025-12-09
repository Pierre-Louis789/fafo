# 🕵️ F‑*‑F‑O  
**F*ck Around and Find Out — an immersive word deduction arcade game**

---

## 📖 Overview
F‑A‑F‑O (F*ck Around and Find Out) is an immersive word deduction arcade game that blends the logic of classic word puzzles with the energy of retro arcade design. Players attempt to solve a hidden five‑letter word within six guesses, earning points for correct attempts and spending them strategically on clues.  

The project emphasizes:
- **Cinematic Arcade Feel** — animated feedback, sound effects, and bold typography create a game‑like atmosphere.  
- **Accessibility** — keyboard input, focus management, and responsive layout ensure frustration‑free play across devices.  
- **Replayability** — daily puzzles, random mode, and a scoring system keep players engaged over time.  
- **Clarity & Modularity** — the codebase is structured for readability, scalability, and future feature expansion.  

F*FO is designed not only as a fun puzzle challenge but also as a demonstration of modular game architecture, accessible UI/UX, and editorial polish in web development.

---

## 🎯 Objectives

- **Engage players with efficient deduction mechanics**  
  The core challenge is to solve a hidden five‑letter word within six attempts. Each guess provides immediate feedback, encouraging players to think critically, eliminate possibilities, and refine their strategy as they progress.

- **Balance risk and reward through scoring and clues**  
  Points are earned for successful guesses and can be spent to purchase clues. This system introduces a layer of decision‑making: players must weigh the value of conserving points against the advantage of revealing a letter. It keeps gameplay dynamic and rewards thoughtful choices.

- **Deliver a polished arcade‑style experience**  
  Beyond the puzzle itself, FAFO aims to feel like an arcade game. Animated tile feedback, floating score effects, and background audio create a cinematic atmosphere. The interface is responsive and accessible, ensuring smooth play across desktop and mobile devices.

- **Track progress for replayability and growth**  
  Stats and history panels record games played, win rate, streaks, and guess distribution. This data helps players see improvement over time, identify patterns in their play, and stay motivated to return daily or explore random mode challenges.

---

## 🕹️ Gameplay

1. **Fill the grid with letters**  
   Players interact with the game either by typing on their physical keyboard or by clicking the on‑screen keys. Each input fills the next available tile in the current row of the word grid. This dual input system was implemented to ensure accessibility across desktop and mobile devices.

2. **Submit a guess with Enter**  
   Once a row is filled with five letters, pressing **Enter** submits the guess. The game logic checks the word against the target word stored in the word bank. This validation step was coded to prevent incomplete or invalid submissions.

3. **Receive instant feedback**  
   Each tile updates visually to show the accuracy of the guess:  
   - 🟩 **Correct** — the letter is in the right position.  
   - 🟨 **Present** — the letter exists in the word but in a different position.  
   - ⬜️ **Absent** — the letter is not part of the word.  
   This feedback system was built by scanning each tile and applying CSS classes (`correct`, `present`, `absent`) to trigger color changes and animations.

4. **Earn points for progress**  
   Correct guesses contribute to the player’s score. Points are tracked in real time and displayed in the score panel. The scoring system was designed to reward accuracy and encourage efficient deduction.

5. **Spend points to buy clues**  
   Players can use their accumulated points to purchase clues. Options include revealing a random unrevealed letter, the first letter, or the last letter. This mechanic was implemented with `data-cost` attributes on clue buttons, ensuring the cost is deducted from the score before revealing the hint.

6. **Win by solving within six tries**  
   The objective is to uncover the hidden word within six attempts. If the player succeeds, the endgame overlay displays a victory message and records the result in the stats/history system. If they fail, the overlay reveals the target word and updates the loss record. This win/lose logic was coded to trigger once the current row counter reaches six or the word is correctly guessed.

---

## ✨ Features

- **Daily Mode**  
  A new puzzle is generated each day, giving players a fresh challenge and encouraging regular play. This mode resets automatically based on the system date, ensuring everyone faces the same daily word.

- **Random Mode**  
  For unlimited practice and replayability, players can launch random puzzles at any time. This mode uses the word bank to select a word at random, making each round unique and unpredictable.

- **Clue Purchase System**  
  Points earned during gameplay can be spent to reveal helpful hints. Options include uncovering a random unrevealed letter, the first letter, or the last letter of the target word. Each clue has a cost defined in the button’s `data-cost` attribute, and the system deducts points before displaying the hint. This mechanic adds a layer of strategy, forcing players to balance risk and reward.

- **Stats & History**  
  The game tracks performance across sessions, recording metrics such as games played, win rate, current streak, best streak, and guess distribution. This data is stored locally so players can monitor their progress and spot patterns in their play style.

- **Arcade Audio**  
  Immersive sound design enhances the experience with background music and effects for key actions (typing, submitting guesses, purchasing clues). Audio elements are toggleable, allowing players to choose between silent focus or full arcade atmosphere.

- **Accessibility**  
  The interface was built with accessibility in mind:  
  - Keyboard input works seamlessly alongside on‑screen keys.  
  - Focus management ensures buttons don’t “stick” after use, preventing accidental re‑triggers with Enter.  
  - Containers like the grid and keyboard are programmatically focusable (`tabindex="-1"`) for smooth navigation.  
  - ARIA labels and roles are applied to modals, navigation, and live regions to support screen readers.  
  Combined, these features make FAFO frustration‑free and inclusive for all players.

---

## 🎨 User Experience (UX)

F*FO is designed to feel less like a static puzzle and more like stepping into an arcade.  
Every interaction — from typing a letter to buying a clue — is crafted to be responsive, intuitive, and rewarding.

### Immersive Atmosphere
- **Cinematic feedback**: Tiles flip, shake, and glow to show accuracy, creating a sense of interaction with each guess.
- **Floating score effects**: Points gained or spent animate on screen, reinforcing the arcade vibe.
- **Background audio**: Music loops and sound effects punctuate actions, immersing players in a retro‑game mood.

### Accessibility & Flow
**Accessibility**: Built with accessibility in mind — keyboard input, focus management, and ARIA support.

### Emotional Engagement
- **Risk vs reward**: The clue purchase system forces players to make strategic choices, adding tension and excitement.
- **Progress tracking**: Stats and history panels give players a sense of growth, motivating them to return daily.
- **Arcade polish**: The combination of animations, audio, and scoring transforms a word puzzle into a game that feels alive.

### Design Philosophy
The UX was built around three guiding principles:
1. **Clarity** — feedback is immediate and visually distinct.  
2. **Accessibility** — no player should feel blocked by controls or navigation.  
3. **Polish** — every detail, from button blur to modal transitions, contributes to a seamless, game‑like experience.

---

## 📊 Stats

The stats panel provides players with a snapshot of their overall performance.  
It records and displays key metrics across all sessions:

- **Games Played** — total number of rounds attempted.  
- **Win Rate** — percentage of games successfully solved.  
- **Current Streak** — number of consecutive wins in progress.  
- **Best Streak** — longest winning streak achieved.  
- **Guess Distribution** — a bar chart showing how often players solve the puzzle in 1–6 guesses.  

### Guess Distribution Chart
The chart is rendered as a horizontal bar graph, where each bar corresponds to the number of guesses taken to solve a word.  
For example:
- A tall bar under “3” means the player often solves in three guesses.  
- A shorter bar under “6” means fewer games are solved at the last attempt.  

This visualization helps players identify patterns in their deduction style and measure improvement over time.

---

## 📜 Game History

The history panel records individual game outcomes, allowing players to review past performance in detail.  
It includes:

- **Date & Mode** — when the game was played and whether it was Daily or Random.  
- **Target Word** — the hidden word for that round.  
- **Result** — win or loss, with the number of guesses used.  
- **Points Earned/Spent** — score changes based on correct guesses and clue purchases.  

### History Log
Games are listed chronologically, creating a timeline of progress.  
This log helps players:
- Spot trends (e.g., struggling with certain word patterns).  
- Reflect on clue usage and scoring decisions.  
- Track short‑term growth beyond the summary stats.  

---

### How It Works
Both **Stats** and **History** are stored locally in the browser using `localStorage`.  
This ensures data persists between sessions without requiring an account or server.  
Charts are generated dynamically from stored values, updating automatically after each game.

---

## 🛠️ Technologies

- **HTML5 / Semantic Structure**  
  Used to build the foundation of the game interface. Elements like `<header>`, `<main>`, `<aside>`, and `<footer>` provide clarity and accessibility. ARIA roles and labels are applied to modals and navigation for screen reader support.

- **CSS3 / Styling & Animations**  
  Provides the retro arcade look and feel. CSS classes (`correct`, `present`, `absent`) trigger color changes and animations on tiles. Responsive design ensures smooth play across desktop and mobile. Transitions and keyframes add cinematic polish to feedback and overlays.

- **JavaScript (ES6)**  
  Powers the game logic:  
  - Validates guesses against the word bank.  
  - Updates tile states with feedback.  
  - Tracks scoring and clue purchases.  
  - Manages overlays (intro, clue popup, endgame).  
  - Handles keyboard input and focus management.  
  Modular functions keep the codebase scalable and easy to maintain.

- **LocalStorage**  
  Stores player stats and history directly in the browser. This includes games played, win rate, streaks, and guess distribution. Data persists between sessions without requiring a server or login.

- **Audio API**  
  Integrates background music and sound effects. Toggleable controls allow players to enable or disable sound. Audio feedback is tied to key actions (typing, submitting guesses, buying clues) to reinforce the arcade atmosphere.

- **Responsive Design Techniques**  
  Media queries and flexible layouts adapt the interface to different screen sizes. The clue popup and overlays are optimized for mobile play, ensuring usability across devices.

- **Accessibility Practices**  
  - `tabindex="-1"` applied to grid and keyboard for programmatic focus.  
  - Buttons blur after use to prevent sticky Enter key behavior.  
  - ARIA attributes (`aria-label`, `aria-modal`, `aria-live`) enhance screen reader compatibility.  
  - Focus is restored to the keyboard after closing modals for seamless navigation.

- **Word Bank Data Management**  
  A large, alphabetically organized word list is stored in `wordBank.js`. This supports both daily puzzles (deterministic selection) and random mode (randomized selection). The structure ensures scalability and replayability.

- **Overlay & Modal System**  
  Implemented with HTML/CSS/JS to handle intro screen, clue popup, and endgame states. Each modal uses `role="dialog"` and traps focus to maintain accessibility standards.
  

---

## 📂 Project Structure

fafo/
├── index.html          # Entry point for the game
├── assets/             # Main game UI components
│   └── images/         # Optional visual assets
├── style.css           # Core styling and layout
├── sounds/             # Arcade sound effects
├── script.js           # Game logic and interactions
└── data/
    └── wordBank.js     # Word list for gameplay

---

## ♿ Accessibility

- **Keyboard + on‑screen input**: Players can type or tap, making the game equally smooth on desktop and mobile.
- **Focus management**: Buttons blur after use, preventing accidental re‑triggers with Enter. The grid and keyboard are programmatically focusable, ensuring frustration‑free navigation.
- **Responsive layout**: The interface adapts to mobile and desktop, with a dedicated clue popup for smaller screens.  

---

## 🔮 Future Improvements
- Add multiplayer or competitive modes.  
- Expand word bank with difficulty levels.  
- Enhance animations and sound effects for more arcade polish.  
- Implement leaderboards and social sharing.  

---

## Sounds

Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=54828">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=54828">Pixabay</a>

---

## 👨‍💻 Credits


Built by Pierre with a focus on modularity, accessibility, and arcade polish.

---

## 📜 License
This project is licensed under the MIT License — feel free to use, modify, and share.


