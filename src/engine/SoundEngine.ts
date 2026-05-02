import { getStoredBoolean, setStoredBoolean } from "../utils/storage";

export class SoundEngine {
  private context: AudioContext | null = null;
  private muted = getStoredBoolean("gamefolio:muted", true);

  isMuted(): boolean {
    return this.muted;
  }

  toggle(): boolean {
    this.muted = !this.muted;
    setStoredBoolean("gamefolio:muted", this.muted);
    return this.muted;
  }

  beep(type: "score" | "jump" | "shoot" | "hit" | "win" = "score"): void {
    if (this.muted) return;
    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = {
      score: 540,
      jump: 420,
      shoot: 760,
      hit: 160,
      win: 920,
    };

    oscillator.type = type === "hit" ? "sawtooth" : "square";
    oscillator.frequency.value = frequencies[type];
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.17);
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }
}
