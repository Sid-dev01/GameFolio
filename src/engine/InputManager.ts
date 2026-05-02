type Action = "left" | "right" | "up" | "down" | "action" | "pause";

const keyMap = new Map<string, Action>([
  ["ArrowLeft", "left"],
  ["a", "left"],
  ["A", "left"],
  ["ArrowRight", "right"],
  ["d", "right"],
  ["D", "right"],
  ["ArrowUp", "up"],
  ["w", "up"],
  ["W", "up"],
  ["ArrowDown", "down"],
  ["s", "down"],
  ["S", "down"],
  [" ", "action"],
  ["Enter", "action"],
  ["Escape", "pause"],
]);

export class InputManager {
  private readonly keys = new Set<Action>();
  private readonly virtualKeys = new Set<Action>();

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown, { passive: false });
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", () => this.keys.clear());
  }

  isDown(action: Action): boolean {
    return this.keys.has(action) || this.virtualKeys.has(action);
  }

  setVirtual(action: Action, active: boolean): void {
    if (active) {
      this.virtualKeys.add(action);
    } else {
      this.virtualKeys.delete(action);
    }
  }

  attachVirtualControls(root: ParentNode): void {
    root.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
      const action = button.dataset.action as Action | undefined;
      if (!action) return;
      const activate = (event: PointerEvent): void => {
        event.preventDefault();
        this.setVirtual(action, true);
        button.setPointerCapture?.(event.pointerId);
      };
      const release = (): void => this.setVirtual(action, false);
      button.addEventListener("pointerdown", activate);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointerleave", release);
      button.addEventListener("pointercancel", release);
    });
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.isTypingTarget(event.target)) return;
    const action = keyMap.get(event.key);
    if (!action) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
      event.preventDefault();
    }
    this.keys.add(action);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const action = keyMap.get(event.key);
    if (action) this.keys.delete(action);
  };

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }
}
