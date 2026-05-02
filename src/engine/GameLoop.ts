export type GameTick = (deltaSeconds: number, elapsedSeconds: number) => void;

export class GameLoop {
  private frame = 0;
  private previous = 0;
  private elapsed = 0;
  private running = false;

  constructor(private readonly tick: GameTick) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.previous = performance.now();
    this.frame = window.requestAnimationFrame(this.step);
  }

  stop(): void {
    this.running = false;
    window.cancelAnimationFrame(this.frame);
  }

  private readonly step = (time: number): void => {
    if (!this.running) return;
    const delta = Math.min((time - this.previous) / 1000, 0.05);
    this.previous = time;
    this.elapsed += delta;
    this.tick(delta, this.elapsed);
    this.frame = window.requestAnimationFrame(this.step);
  };
}
