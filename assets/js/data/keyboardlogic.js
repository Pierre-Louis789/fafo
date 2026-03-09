function updateKeyState(currentState, newState) {
  // If the key is already correct, never downgrade
  if (currentState === "correct") return "correct";

  // If new state is correct, upgrade
  if (newState === "correct") return "correct";

  // If new state is present, upgrade unless current is correct
  if (newState === "present") return "present";

  // If new state is absent, only apply if current is empty
  if (!currentState) return "absent";

  return currentState;
}

module.exports = { updateKeyState };
