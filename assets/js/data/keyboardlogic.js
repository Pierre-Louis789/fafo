/* global module */

function updateKeyState(currentState, newState) {
  
  if (currentState === "correct") return "correct";

  
  if (newState === "correct") return "correct";

 
  if (newState === "present") return "present";


  if (!currentState) return "absent";

  return currentState;
}

module.exports = { updateKeyState };
