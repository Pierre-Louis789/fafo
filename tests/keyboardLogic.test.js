const { updateKeyState } = require("../data/keyboardLogic.js");

describe("Keyboard state logic", () => {
  test("correct overrides everything", () => {
    expect(updateKeyState("present", "correct")).toBe("correct");
    expect(updateKeyState("absent", "correct")).toBe("correct");
    expect(updateKeyState("", "correct")).toBe("correct");
  });

  test("cannot downgrade from correct", () => {
    expect(updateKeyState("correct", "present")).toBe("correct");
    expect(updateKeyState("correct", "absent")).toBe("correct");
  });

  test("present overrides absent", () => {
    expect(updateKeyState("absent", "present")).toBe("present");
  });

  test("absent does not override present", () => {
    expect(updateKeyState("present", "absent")).toBe("present");
  });

  test("absent applies only when no previous state", () => {
    expect(updateKeyState("", "absent")).toBe("absent");
  });
});
