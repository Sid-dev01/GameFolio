import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style/globals.css";
import { GameLoop } from "./engine/GameLoop";
import { InputManager } from "./engine/InputManager";
import { SoundEngine } from "./engine/SoundEngine";
import { portfolio, type Experience, type Project, type Skill } from "./data/portfolio";
import { clamp, easeOutCubic, lerp, randomRange } from "./utils/math";
import { deviceMemory, prefersReducedMotion } from "./utils/device";
import { getStoredNumber, setStoredNumber } from "./utils/storage";

const reducedMotion = prefersReducedMotion();
const input = new InputManager();
const sound = new SoundEngine();

type GameInstance = {
  start: () => void;
  stop: () => void;
  resize?: () => void;
};

type Point = { x: number; y: number };

const sections = [
  { id: "hero", title: "Launch" },
  { id: "about", title: "About" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "experience", title: "Experience" },
  { id: "contact", title: "Contact" },
];

function projectCard(project: Project, className = ""): string {
  return `
    <article class="project-card tilt-card ${className}" style="--accent:${project.accent}">
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
      <div class="tag-list">${project.stack.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="project-actions">
        <a href="${project.liveUrl}" aria-label="Open ${project.title} live project">Live</a>
        <a href="${project.sourceUrl}" aria-label="Open ${project.title} source code">Source</a>
      </div>
    </article>
  `;
}

function skillMeter(skill: Skill): string {
  return `
    <div class="skill-meter" data-skill="${skill.name}" data-target="${skill.value}" style="--skill-color:${skill.color}; --value:14%">
      <div class="skill-meter__label">
        <strong>${skill.name}</strong>
        <span>0%</span>
      </div>
      <div class="skill-meter__track"><span class="skill-meter__bar"></span></div>
    </div>
  `;
}

function timelineItem(item: Experience, index: number): string {
  return `
    <article class="timeline-item" data-timeline-index="${index}">
      <time>${item.year}</time>
      <h3>${item.role}</h3>
      <p><strong>${item.company}</strong> - ${item.summary}</p>
    </article>
  `;
}

function virtualPad(includeVertical = true): string {
  return `
    <div class="virtual-pad" aria-label="Touch controls">
      ${includeVertical ? `<button data-action="up" aria-label="Up">Up</button>` : ""}
      <button data-action="action" aria-label="Action">Go</button>
      <button data-action="left" aria-label="Left">Left</button>
      ${includeVertical ? `<button data-action="down" aria-label="Down">Down</button>` : ""}
      <button data-action="right" aria-label="Right">Right</button>
    </div>
  `;
}

function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  app.innerHTML = `
    <div class="app-shell">
      <div class="top-actions">
        <button id="theme-toggle" class="icon-button magnetic" type="button" aria-label="Toggle color theme">T</button>
        <button id="sound-toggle" class="icon-button magnetic" type="button" aria-label="Toggle sound">${sound.isMuted() ? "M" : "S"}</button>
      </div>
      <nav class="dot-nav" aria-label="Portfolio sections">
        ${sections.map((section) => `<a href="#${section.id}" aria-label="${section.title}" data-dot="${section.id}"></a>`).join("")}
      </nav>

      <main>
        <section id="hero" class="section hero" data-section="hero">
          <canvas id="hero-canvas" class="hero__canvas" aria-label="Interactive particle warp field" tabindex="0"></canvas>
          <button class="help-button magnetic" type="button" data-help="hero" aria-label="Show launch controls">?</button>
          <div class="controls-legend" data-legend="hero">Move pointer to steer. Click or tap to launch.</div>
          <div class="hero__copy">
            <p class="section__kicker">Interactive Portfolio</p>
            <h1>${portfolio.name}</h1>
            <p class="hero__role">${portfolio.role}</p>
            <p class="hero__tagline">${portfolio.tagline}</p>
            <div class="hero__actions">
              <a class="button button--primary magnetic" href="#projects">Projects</a>
              <a class="button magnetic" href="#contact">Contact</a>
            </div>
            <div class="hero__title-card tilt-card">
              <h3>GameFolio</h3>
              <p>Six arcade interactions, one static deployment, and every core detail visible from the start.</p>
            </div>
          </div>
        </section>

        <section id="about" class="section" data-section="about">
          <div class="game-shell canvas-standard">
            <canvas id="pong-canvas" width="600" height="400" aria-label="Retro Pong about game" tabindex="0"></canvas>
            <button class="help-button magnetic" type="button" data-help="about" aria-label="Show Pong controls">?</button>
            <div class="controls-legend" data-legend="about">Mouse, drag, Up, or Down moves the paddle. First to five wins.</div>
            ${virtualPad()}
          </div>
          <div class="content-panel">
            <p class="section__kicker">About Me</p>
            <h2>Playful systems, serious polish.</h2>
            <p>${portfolio.about}</p>
            <div class="stat-grid">
              ${portfolio.stats.map((stat) => `<div class="stat-card"><strong>${stat.value}</strong><span>${stat.label}</span></div>`).join("")}
            </div>
            <p id="pong-welcome">Best Pong score: ${getStoredNumber("gamefolio:pongWins")} wins</p>
            <ul class="value-list">
              ${portfolio.values.map((value) => `<li class="value-chip">${value}</li>`).join("")}
            </ul>
          </div>
        </section>

        <section id="skills" class="section" data-section="skills">
          <div class="game-shell canvas-tall">
            <canvas id="tetris-canvas" width="300" height="600" aria-label="Skill Tetris game" tabindex="0"></canvas>
            <button class="help-button magnetic" type="button" data-help="skills" aria-label="Show Tetris controls">?</button>
            <div class="controls-legend" data-legend="skills">Arrows or buttons move. Up rotates. Go drops.</div>
            ${virtualPad()}
          </div>
          <div class="content-panel">
            <p class="section__kicker">Skills</p>
            <h2>Stack as score system.</h2>
            <svg id="radar" class="radar" viewBox="-120 -120 240 240" role="img" aria-label="Skill radar chart"></svg>
            <div class="skill-list">
              ${portfolio.skills.map(skillMeter).join("")}
            </div>
          </div>
        </section>

        <section id="projects" class="section" data-section="projects">
          <div class="game-shell canvas-wide">
            <canvas id="runner-canvas" width="800" height="300" aria-label="Endless runner projects game" tabindex="0"></canvas>
            <button class="help-button magnetic" type="button" data-help="projects" aria-label="Show runner controls">?</button>
            <div class="controls-legend" data-legend="projects">Space, tap, Up, or Go jumps. Double jump is enabled.</div>
            ${virtualPad(false)}
          </div>
          <div class="content-panel">
            <p class="section__kicker">Projects</p>
            <h2>Work that moves.</h2>
            <p>Core projects are ready to inspect. Running farther reveals a bonus case study.</p>
            <div class="project-grid">
              ${portfolio.projects.map((project) => projectCard(project)).join("")}
              ${projectCard(portfolio.secretProject, "is-secret")}
            </div>
          </div>
        </section>

        <section id="experience" class="section" data-section="experience">
          <div class="game-shell canvas-square">
            <canvas id="snake-canvas" width="500" height="500" aria-label="Snake timeline game" tabindex="0"></canvas>
            <button class="help-button magnetic" type="button" data-help="experience" aria-label="Show Snake controls">?</button>
            <div class="controls-legend" data-legend="experience">WASD, arrows, swipe, or buttons guide the timeline snake.</div>
            ${virtualPad()}
          </div>
          <div class="content-panel">
            <p class="section__kicker">Experience</p>
            <h2>Timeline with momentum.</h2>
            <div class="timeline">
              ${portfolio.experience.map(timelineItem).join("")}
            </div>
          </div>
        </section>

        <section id="contact" class="section" data-section="contact">
          <div class="game-shell canvas-standard">
            <canvas id="shooter-canvas" width="600" height="400" aria-label="Space shooter contact game" tabindex="0"></canvas>
            <button class="help-button magnetic" type="button" data-help="contact" aria-label="Show shooter controls">?</button>
            <div class="controls-legend" data-legend="contact">Move with arrows, drag, or buttons. Space or Go fires.</div>
            ${virtualPad(false)}
          </div>
          <div class="content-panel">
            <p class="section__kicker">Contact</p>
            <h2>Send the next quest.</h2>
            <div class="contact-grid">
              <a class="contact-card magnetic" href="mailto:${portfolio.email}"><strong>Email</strong><p>${portfolio.email}</p></a>
              <div class="contact-card"><strong>Location</strong><p>${portfolio.location}</p></div>
            </div>
            <form id="contact-form" class="contact-form">
              <div class="field" data-field-index="0">
                <label for="name">Name</label>
                <input id="name" name="name" type="text" autocomplete="name" required />
              </div>
              <div class="field" data-field-index="1">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" autocomplete="email" required />
              </div>
              <div class="field" data-field-index="2">
                <label for="message">Message</label>
                <textarea id="message" name="message" required></textarea>
              </div>
              <button class="button button--primary magnetic" type="submit">Send</button>
              <p id="form-status" class="form-status" aria-live="polite"></p>
            </form>
            <div class="social-row">
              ${portfolio.socials.map((social) => `<a class="button magnetic" href="${social.href}">${social.label}</a>`).join("")}
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

function setupLoader(): void {
  const loader = document.querySelector<HTMLDivElement>("#loader");
  const bar = document.querySelector<HTMLSpanElement>("#loader-bar");
  const message = document.querySelector<HTMLElement>("#loader-message");
  const messages = ["Compiling shaders...", "Tuning input latency...", "Charging particle rails...", "Spawning project cards..."];
  let progress = 0;
  let previousMessage = 0;
  document.body.classList.add("is-loading");

  const tick = (): void => {
    progress = Math.min(progress + randomRange(0.05, 0.16), 1);
    if (bar) bar.style.width = `${Math.round(progress * 100)}%`;
    const messageIndex = Math.min(messages.length - 1, Math.floor(progress * messages.length));
    if (message && messageIndex !== previousMessage) {
      previousMessage = messageIndex;
      message.textContent = messages[messageIndex];
    }

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      window.setTimeout(() => {
        loader?.classList.add("is-hidden");
        document.body.classList.remove("is-loading");
      }, reducedMotion ? 0 : 220);
    }
  };

  window.requestAnimationFrame(tick);
}

function setupGlobalUi(): void {
  const progress = document.querySelector<HTMLDivElement>("#scroll-progress");
  const cursor = document.querySelector<HTMLDivElement>("#cursor");
  const soundButton = document.querySelector<HTMLButtonElement>("#sound-toggle");
  const themeButton = document.querySelector<HTMLButtonElement>("#theme-toggle");

  soundButton?.addEventListener("click", () => {
    const muted = sound.toggle();
    soundButton.textContent = muted ? "M" : "S";
    soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    sound.beep("score");
  });

  themeButton?.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    themeButton.setAttribute("aria-label", `Switch to ${next === "light" ? "dark" : "light"} theme`);
  });

  window.addEventListener(
    "scroll",
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max <= 0 ? 0 : window.scrollY / max;
      if (progress) progress.style.width = `${clamp(ratio * 100, 0, 100)}%`;
    },
    { passive: true },
  );

  if (cursor) {
    window.addEventListener("pointermove", (event) => {
      cursor.classList.add("is-active");
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });

    document.addEventListener("pointerover", (event) => {
      if ((event.target as Element | null)?.closest("a, button, canvas, input, textarea")) {
        cursor.classList.add("is-hovering");
      }
    });

    document.addEventListener("pointerout", (event) => {
      if ((event.target as Element | null)?.closest("a, button, canvas, input, textarea")) {
        cursor.classList.remove("is-hovering");
      }
    });
  }

  document.querySelectorAll<HTMLElement>(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left - rect.width / 2) * 0.16, -8, 8);
      const y = clamp((event.clientY - rect.top - rect.height / 2) * 0.16, -8, 8);
      element.style.setProperty("--mx", `${x}px`);
      element.style.setProperty("--my", `${y}px`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    });
  });

  document.querySelectorAll<HTMLElement>(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${clamp(x * 10, -8, 8)}deg`);
      card.style.setProperty("--rx", `${clamp(y * -10, -8, 8)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

function setupControls(): void {
  input.attachVirtualControls(document);
  document.querySelectorAll<HTMLButtonElement>("[data-help]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.help;
      document.querySelector<HTMLElement>(`[data-legend="${key}"]`)?.classList.toggle("is-hidden");
    });
  });

  document.querySelectorAll<HTMLElement>(".controls-legend").forEach((legend) => {
    window.setTimeout(() => legend.classList.add("is-hidden"), 3200);
  });
}

function setupNav(): void {
  const dots = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>("[data-dot]").forEach((dot) => {
    if (dot.dataset.dot) dots.set(dot.dataset.dot, dot);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        dots.forEach((dot) => dot.classList.remove("is-active"));
        const id = (entry.target as HTMLElement).dataset.section;
        if (id) dots.get(id)?.classList.add("is-active");
      });
    },
    { threshold: 0.45 },
  );

  document.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => observer.observe(section));
}

function setupGsap(): void {
  if (reducedMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero__copy > *", {
    y: 28,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.2,
  });

  gsap.utils.toArray<HTMLElement>(".content-panel, .game-shell").forEach((element) => {
    gsap.from(element, {
      y: 36,
      opacity: 0,
      duration: 0.72,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
      },
    });
  });
}

function drawRadar(): void {
  const svg = document.querySelector<SVGSVGElement>("#radar");
  if (!svg) return;
  const levels = [0.25, 0.5, 0.75, 1];
  const pointsFor = (scale: number): string =>
    portfolio.skills
      .map((_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / portfolio.skills.length;
        return `${Math.cos(angle) * 95 * scale},${Math.sin(angle) * 95 * scale}`;
      })
      .join(" ");
  const dataPoints = portfolio.skills
    .map((skill, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / portfolio.skills.length;
      const radius = (skill.value / 100) * 95;
      return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
    })
    .join(" ");

  svg.innerHTML = `
    ${levels.map((level) => `<polygon points="${pointsFor(level)}" fill="none" stroke="rgba(255,255,255,0.16)" />`).join("")}
    ${portfolio.skills
      .map((skill, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / portfolio.skills.length;
        return `<text x="${Math.cos(angle) * 112}" y="${Math.sin(angle) * 112}" text-anchor="middle" dominant-baseline="middle" fill="${skill.color}" font-size="9">${skill.name}</text>`;
      })
      .join("")}
    <polygon points="${dataPoints}" fill="rgba(0,212,255,0.18)" stroke="#00d4ff" stroke-width="2" />
  `;
}

function animateSkillMeters(multiplier = 1): void {
  document.querySelectorAll<HTMLElement>(".skill-meter").forEach((meter) => {
    const target = Number(meter.dataset.target ?? 0);
    const value = clamp(Math.round(target * multiplier), 0, target);
    meter.style.setProperty("--value", `${value}%`);
    meter.querySelector("span")!.textContent = `${value}%`;
  });
}

class HeroWarp implements GameInstance {
  private frame = 0;
  private running = false;
  private pointer = { x: 0, y: 0 };
  private cleanup: (() => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    void this.init();
  }

  stop(): void {
    this.running = false;
    window.cancelAnimationFrame(this.frame);
    this.cleanup?.();
    this.cleanup = null;
  }

  resize(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  private async init(): Promise<void> {
    const THREE = await import("three");
    if (!this.running) return;

    const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 120);
    camera.position.z = 5;

    const count = deviceMemory() < 4 ? 2300 : 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = randomRange(-28, 28);
      positions[i * 3 + 1] = randomRange(-18, 18);
      positions[i * 3 + 2] = randomRange(-95, 8);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    let warp = 0;
    const onPointerMove = (event: PointerEvent): void => {
      this.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onLaunch = (): void => {
      warp = 1;
      document.body.classList.add("hero-launched");
      sound.beep("win");
    };
    const resize = (): void => {
      const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
      const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerdown", onLaunch);
    resize();
    this.cleanup = () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      this.canvas.removeEventListener("pointerdown", onLaunch);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };

    let previous = performance.now();
    const render = (time: number): void => {
      if (!this.running) return;
      const delta = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      const position = geometry.getAttribute("position") as import("three").BufferAttribute;
      const speed = lerp(10, 74, warp);
      for (let i = 0; i < count; i += 1) {
        const zIndex = i * 3 + 2;
        positions[zIndex] += speed * delta;
        if (positions[zIndex] > 9) {
          positions[i * 3] = randomRange(-28, 28);
          positions[i * 3 + 1] = randomRange(-18, 18);
          positions[zIndex] = randomRange(-95, -55);
        }
      }
      position.needsUpdate = true;
      stars.rotation.y = lerp(stars.rotation.y, this.pointer.x * 0.08, 0.06);
      stars.rotation.x = lerp(stars.rotation.x, this.pointer.y * -0.06, 0.06);
      material.size = lerp(material.size, warp > 0.2 ? 0.065 : 0.035, 0.1);
      warp = Math.max(0, warp - delta * 0.82);
      renderer.render(scene, camera);
      this.frame = window.requestAnimationFrame(render);
    };
    this.frame = window.requestAnimationFrame(render);
  }
}

abstract class CanvasGame implements GameInstance {
  protected readonly ctx: CanvasRenderingContext2D;
  private readonly loop: GameLoop;
  private pauseLatch = false;
  protected paused = false;

  constructor(
    protected readonly canvas: HTMLCanvasElement,
    protected readonly width: number,
    protected readonly height: number,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas2D is not available.");
    this.ctx = ctx;
    this.loop = new GameLoop((delta, elapsed) => {
      if (input.isDown("pause") && !this.pauseLatch) {
        this.paused = !this.paused;
        this.pauseLatch = true;
      }
      if (!input.isDown("pause")) this.pauseLatch = false;
      if (!this.paused) this.update(delta, elapsed);
      this.render();
    });
    this.canvas.addEventListener("pointerdown", () => {
      this.canvas.focus();
      this.paused = false;
    });
    this.resize();
  }

  start(): void {
    this.paused = false;
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  protected clear(fill = "#050712"): void {
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  protected abstract update(delta: number, elapsed: number): void;
  protected abstract render(): void;
}

class PongGame extends CanvasGame {
  private playerY = 160;
  private aiY = 160;
  private ball = { x: 300, y: 200, vx: 220, vy: 130 };
  private playerScore = 0;
  private aiScore = 0;
  private wins = getStoredNumber("gamefolio:pongWins");

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 600, 400);
    const move = (event: PointerEvent): void => {
      const rect = this.canvas.getBoundingClientRect();
      this.playerY = clamp(((event.clientY - rect.top) / rect.height) * this.height - 45, 0, this.height - 90);
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", move);
  }

  protected update(delta: number): void {
    const paddleSpeed = 320;
    if (input.isDown("up")) this.playerY -= paddleSpeed * delta;
    if (input.isDown("down")) this.playerY += paddleSpeed * delta;
    this.playerY = clamp(this.playerY, 0, this.height - 90);

    const aiTarget = this.ball.y - 45;
    this.aiY = lerp(this.aiY, aiTarget, 0.045 + Math.min(this.playerScore, 4) * 0.006);
    this.aiY = clamp(this.aiY, 0, this.height - 90);

    this.ball.x += this.ball.vx * delta;
    this.ball.y += this.ball.vy * delta;

    if (this.ball.y < 10 || this.ball.y > this.height - 10) this.ball.vy *= -1;

    if (this.ball.x < 34 && this.ball.y > this.playerY && this.ball.y < this.playerY + 90) {
      this.ball.vx = Math.abs(this.ball.vx) + 14;
      this.ball.vy += (this.ball.y - (this.playerY + 45)) * 3.2;
      sound.beep("score");
    }

    if (this.ball.x > this.width - 34 && this.ball.y > this.aiY && this.ball.y < this.aiY + 90) {
      this.ball.vx = -Math.abs(this.ball.vx) - 10;
      this.ball.vy += (this.ball.y - (this.aiY + 45)) * 2.8;
      sound.beep("score");
    }

    if (this.ball.x < -20) {
      this.aiScore += 1;
      this.resetBall(-1);
    }

    if (this.ball.x > this.width + 20) {
      this.playerScore += 1;
      this.resetBall(1);
    }

    if (this.playerScore >= 5) {
      this.wins += 1;
      setStoredNumber("gamefolio:pongWins", this.wins);
      document.querySelector("#pong-welcome")!.textContent = `Welcome back, ${this.wins} Pong wins logged.`;
      document.querySelector("#about .content-panel")?.classList.add("is-unlocked");
      sound.beep("win");
      this.playerScore = 0;
      this.aiScore = 0;
    } else if (this.aiScore >= 5) {
      this.playerScore = 0;
      this.aiScore = 0;
    }
  }

  protected render(): void {
    this.clear("#080914");
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 400);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(18, this.playerY, 12, 90);
    ctx.fillStyle = "#ff2d9b";
    ctx.fillRect(this.width - 30, this.aiY, 12, 90);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "700 42px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(String(this.playerScore), 244, 58);
    ctx.fillText(String(this.aiScore), 330, 58);
  }

  private resetBall(direction: 1 | -1): void {
    this.ball = {
      x: 300,
      y: 200,
      vx: 220 * direction,
      vy: randomRange(-150, 150),
    };
  }
}

type TetrisCell = { color: string; label: string } | null;
type Piece = { matrix: number[][]; color: string; label: string; x: number; y: number };

const tetrisPieces = [
  { label: "TS", color: "#00d4ff", matrix: [[1, 1, 1, 1]] },
  {
    label: "CSS",
    color: "#ff2d9b",
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    label: "UX",
    color: "#ffd166",
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    label: "API",
    color: "#24e17a",
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    label: "JS",
    color: "#6c3de1",
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
];

class TetrisGame extends CanvasGame {
  private readonly cols = 10;
  private readonly rows = 20;
  private readonly cell = 30;
  private grid: TetrisCell[][] = Array.from({ length: 20 }, () => Array<TetrisCell>(10).fill(null));
  private piece = this.createPiece();
  private dropTimer = 0;
  private controlTimer = 0;
  private elapsedGame = 0;
  private ended = false;
  private clears = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 300, 600);
  }

  protected update(delta: number): void {
    if (this.ended) return;
    this.elapsedGame += delta;
    this.dropTimer += delta;
    this.controlTimer -= delta;

    if (this.controlTimer <= 0) {
      if (input.isDown("left")) this.move(-1);
      if (input.isDown("right")) this.move(1);
      if (input.isDown("up")) this.rotate();
      if (input.isDown("action")) this.hardDrop();
      if (input.isDown("down")) this.drop();
      this.controlTimer = 0.12;
    }

    if (this.dropTimer > 0.7) {
      this.drop();
      this.dropTimer = 0;
    }

    if (this.elapsedGame > 60) this.finish();
  }

  protected render(): void {
    this.clear("#060711");
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let x = 0; x <= this.cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * this.cell, 0);
      ctx.lineTo(x * this.cell, this.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cell);
      ctx.lineTo(this.width, y * this.cell);
      ctx.stroke();
    }

    this.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) this.drawCell(x, y, cell.color, cell.label);
      });
    });

    this.piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) this.drawCell(this.piece.x + x, this.piece.y + y, this.piece.color, this.piece.label);
      });
    });

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 14px monospace";
    ctx.fillText(`${Math.max(0, Math.ceil(60 - this.elapsedGame))}s`, 12, 24);
    ctx.fillText(`${this.clears} lines`, 208, 24);
  }

  private drawCell(x: number, y: number, color: string, label: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.fillRect(x * this.cell + 1, y * this.cell + 1, this.cell - 2, this.cell - 2);
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.font = "700 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, x * this.cell + this.cell / 2, y * this.cell + 18);
    ctx.textAlign = "left";
  }

  private createPiece(): Piece {
    const source = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    return {
      matrix: source.matrix.map((row) => [...row]),
      color: source.color,
      label: source.label,
      x: 3,
      y: 0,
    };
  }

  private collides(piece = this.piece): boolean {
    return piece.matrix.some((row, y) =>
      row.some((value, x) => {
        if (!value) return false;
        const gridX = piece.x + x;
        const gridY = piece.y + y;
        return gridX < 0 || gridX >= this.cols || gridY >= this.rows || (gridY >= 0 && this.grid[gridY][gridX]);
      }),
    );
  }

  private move(direction: -1 | 1): void {
    this.piece.x += direction;
    if (this.collides()) this.piece.x -= direction;
  }

  private rotate(): void {
    const matrix = this.piece.matrix[0].map((_, index) => this.piece.matrix.map((row) => row[index]).reverse());
    const previous = this.piece.matrix;
    this.piece.matrix = matrix;
    if (this.collides()) this.piece.matrix = previous;
  }

  private drop(): void {
    this.piece.y += 1;
    if (this.collides()) {
      this.piece.y -= 1;
      this.place();
    }
  }

  private hardDrop(): void {
    while (!this.collides()) this.piece.y += 1;
    this.piece.y -= 1;
    this.place();
  }

  private place(): void {
    this.piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value && this.piece.y + y >= 0) {
          this.grid[this.piece.y + y][this.piece.x + x] = {
            color: this.piece.color,
            label: this.piece.label,
          };
        }
      });
    });
    this.clearLines();
    this.piece = this.createPiece();
    if (this.collides()) this.finish();
  }

  private clearLines(): void {
    const remaining = this.grid.filter((row) => row.some((cell) => !cell));
    const cleared = this.rows - remaining.length;
    if (cleared > 0) {
      this.clears += cleared;
      sound.beep("win");
      while (remaining.length < this.rows) remaining.unshift(Array<TetrisCell>(this.cols).fill(null));
      this.grid = remaining;
      animateSkillMeters(clamp(0.35 + this.clears * 0.12, 0.35, 1));
    }
  }

  private finish(): void {
    this.ended = true;
    animateSkillMeters(1);
    sound.beep("win");
  }
}

class RunnerGame extends CanvasGame {
  private y = 0;
  private velocity = 0;
  private jumps = 0;
  private distance = 0;
  private speed = 250;
  private spawnTimer = 0;
  private readonly obstacles: { x: number; w: number; h: number; label: string }[] = [];
  private highScore = getStoredNumber("gamefolio:runnerHigh");
  private unlockIndex = 0;
  private actionLatch = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 800, 300);
    this.y = this.ground();
    canvas.addEventListener("pointerdown", () => this.jump());
  }

  protected update(delta: number): void {
    if (input.isDown("action") || input.isDown("up")) {
      if (!this.actionLatch) this.jump();
      this.actionLatch = true;
    } else {
      this.actionLatch = false;
    }

    this.velocity += 980 * delta;
    this.y += this.velocity * delta;
    if (this.y >= this.ground()) {
      this.y = this.ground();
      this.velocity = 0;
      this.jumps = 0;
    }

    this.spawnTimer -= delta;
    this.distance += this.speed * delta * 0.05;
    this.speed = Math.min(430, this.speed + delta * 4);
    if (this.spawnTimer <= 0) {
      this.spawnObstacle();
      this.spawnTimer = randomRange(1.0, 1.7);
    }

    this.obstacles.forEach((obstacle) => (obstacle.x -= this.speed * delta));
    while (this.obstacles[0]?.x < -90) this.obstacles.shift();
    if (this.obstacles.some((obstacle) => this.collides(obstacle))) this.crash();

    const nextUnlock = (this.unlockIndex + 1) * 200;
    if (this.distance >= nextUnlock) {
      this.unlockIndex += 1;
      if (this.unlockIndex >= 2) {
        document.querySelector(".project-card.is-secret")?.classList.add("is-revealed");
      }
      sound.beep("win");
    }
  }

  protected render(): void {
    this.clear("#07101b");
    const ctx = this.ctx;
    ctx.fillStyle = "#11233a";
    ctx.fillRect(0, 246, this.width, 54);
    ctx.strokeStyle = "#00d4ff";
    ctx.beginPath();
    ctx.moveTo(0, 246);
    ctx.lineTo(this.width, 246);
    ctx.stroke();

    ctx.fillStyle = "#24e17a";
    ctx.fillRect(76, this.y - 48, 42, 48);
    ctx.fillStyle = "#07101b";
    ctx.fillRect(86, this.y - 38, 8, 8);

    this.obstacles.forEach((obstacle) => {
      ctx.fillStyle = "#ff2d9b";
      ctx.fillRect(obstacle.x, 246 - obstacle.h, obstacle.w, obstacle.h);
      ctx.fillStyle = "#fff";
      ctx.font = "700 12px monospace";
      ctx.fillText(obstacle.label, obstacle.x + 5, 246 - obstacle.h - 8);
    });

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "700 15px monospace";
    ctx.fillText(`${Math.floor(this.distance)}m`, 18, 28);
    ctx.fillText(`Best ${Math.floor(this.highScore)}m`, 18, 50);
  }

  private ground(): number {
    return 246;
  }

  private jump(): void {
    if (this.jumps >= 2) return;
    this.velocity = -480;
    this.jumps += 1;
    sound.beep("jump");
  }

  private spawnObstacle(): void {
    const labels = ["CORS", "merge", "deadline", "cache", "scope"];
    this.obstacles.push({
      x: this.width + 20,
      w: randomRange(32, 54),
      h: randomRange(34, 72),
      label: labels[Math.floor(Math.random() * labels.length)],
    });
  }

  private collides(obstacle: { x: number; w: number; h: number }): boolean {
    const player = { x: 76, y: this.y - 48, w: 42, h: 48 };
    return (
      player.x < obstacle.x + obstacle.w &&
      player.x + player.w > obstacle.x &&
      player.y < 246 &&
      player.y + player.h > 246 - obstacle.h
    );
  }

  private crash(): void {
    this.highScore = Math.max(this.highScore, this.distance);
    setStoredNumber("gamefolio:runnerHigh", this.highScore);
    this.distance = 0;
    this.speed = 250;
    this.obstacles.length = 0;
    this.y = this.ground();
    this.velocity = 0;
    this.jumps = 0;
    sound.beep("hit");
  }
}

class SnakeGame extends CanvasGame {
  private readonly size = 20;
  private readonly cell = 25;
  private snake: Point[] = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  private direction: Point = { x: 1, y: 0 };
  private nextDirection: Point = { x: 1, y: 0 };
  private food: Point = { x: 14, y: 10 };
  private tick = 0;
  private eaten = 0;
  private touchStart: Point | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 500, 500);
    canvas.addEventListener("pointerdown", (event) => {
      this.touchStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", (event) => {
      if (!this.touchStart) return;
      const dx = event.clientX - this.touchStart.x;
      const dy = event.clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        this.setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
      this.touchStart = null;
    });
  }

  protected update(delta: number): void {
    if (input.isDown("left")) this.setDirection({ x: -1, y: 0 });
    if (input.isDown("right")) this.setDirection({ x: 1, y: 0 });
    if (input.isDown("up")) this.setDirection({ x: 0, y: -1 });
    if (input.isDown("down")) this.setDirection({ x: 0, y: 1 });

    this.tick += delta;
    if (this.tick < 0.13) return;
    this.tick = 0;
    this.direction = this.nextDirection;
    const head = this.snake[0];
    const next = {
      x: (head.x + this.direction.x + this.size) % this.size,
      y: (head.y + this.direction.y + this.size) % this.size,
    };

    if (this.snake.some((part) => part.x === next.x && part.y === next.y)) {
      this.reset();
      return;
    }

    this.snake.unshift(next);
    if (next.x === this.food.x && next.y === this.food.y) {
      this.eaten += 1;
      this.activateTimeline();
      this.placeFood();
      sound.beep("score");
    } else {
      this.snake.pop();
    }
  }

  protected render(): void {
    this.clear("#020805");
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(36,225,122,0.12)";
    for (let i = 0; i <= this.size; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * this.cell, 0);
      ctx.lineTo(i * this.cell, this.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * this.cell);
      ctx.lineTo(this.width, i * this.cell);
      ctx.stroke();
    }
    ctx.fillStyle = "#24e17a";
    this.snake.forEach((part, index) => {
      ctx.globalAlpha = index === 0 ? 1 : 0.74;
      ctx.fillRect(part.x * this.cell + 2, part.y * this.cell + 2, this.cell - 4, this.cell - 4);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(this.food.x * this.cell + this.cell / 2, this.food.y * this.cell + this.cell / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "700 14px monospace";
    ctx.fillText(`nodes ${this.eaten}`, 14, 24);
  }

  private setDirection(direction: Point): void {
    if (direction.x + this.direction.x === 0 && direction.y + this.direction.y === 0) return;
    this.nextDirection = direction;
  }

  private placeFood(): void {
    this.food = {
      x: Math.floor(randomRange(1, this.size - 1)),
      y: Math.floor(randomRange(1, this.size - 1)),
    };
  }

  private activateTimeline(): void {
    const index = (this.eaten - 1) % portfolio.experience.length;
    document.querySelector<HTMLElement>(`[data-timeline-index="${index}"]`)?.classList.add("is-active");
  }

  private reset(): void {
    this.snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    sound.beep("hit");
  }
}

class ShooterGame extends CanvasGame {
  private playerX = 300;
  private readonly bullets: { x: number; y: number }[] = [];
  private readonly enemies: { x: number; y: number; hit: boolean; label: string }[] = [];
  private fireCooldown = 0;
  private fieldIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 600, 400);
    this.resetEnemies();
    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      this.playerX = clamp(((event.clientX - rect.left) / rect.width) * this.width, 24, this.width - 24);
    });
    canvas.addEventListener("pointerdown", () => this.fire());
  }

  protected update(delta: number): void {
    this.fireCooldown -= delta;
    if (input.isDown("left")) this.playerX -= 300 * delta;
    if (input.isDown("right")) this.playerX += 300 * delta;
    if (input.isDown("action") || input.isDown("up")) this.fire();
    this.playerX = clamp(this.playerX, 24, this.width - 24);

    this.bullets.forEach((bullet) => (bullet.y -= 520 * delta));
    while (this.bullets[0]?.y < -20) this.bullets.shift();

    this.enemies.forEach((enemy, index) => {
      if (enemy.hit) return;
      enemy.y += Math.sin(performance.now() / 600 + index) * delta * 10;
      this.bullets.forEach((bullet) => {
        if (Math.abs(bullet.x - enemy.x) < 24 && Math.abs(bullet.y - enemy.y) < 22) {
          enemy.hit = true;
          bullet.y = -100;
          this.revealField();
          sound.beep("shoot");
        }
      });
    });

    if (this.enemies.every((enemy) => enemy.hit)) {
      this.resetEnemies();
      this.launchConfetti();
    }
  }

  protected render(): void {
    this.clear("#080b18");
    const ctx = this.ctx;
    ctx.fillStyle = "#00d4ff";
    ctx.beginPath();
    ctx.moveTo(this.playerX, 338);
    ctx.lineTo(this.playerX - 24, 374);
    ctx.lineTo(this.playerX + 24, 374);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffd166";
    this.bullets.forEach((bullet) => ctx.fillRect(bullet.x - 3, bullet.y - 12, 6, 16));

    this.enemies.forEach((enemy) => {
      if (enemy.hit) return;
      ctx.fillStyle = "#ff2d9b";
      ctx.fillRect(enemy.x - 22, enemy.y - 16, 44, 32);
      ctx.fillStyle = "#fff";
      ctx.font = "700 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(enemy.label, enemy.x, enemy.y + 4);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "700 14px monospace";
    ctx.fillText("zap spam", 14, 26);
  }

  private fire(): void {
    if (this.fireCooldown > 0) return;
    this.fireCooldown = 0.18;
    this.bullets.push({ x: this.playerX, y: 332 });
    sound.beep("shoot");
  }

  private revealField(): void {
    document.querySelector<HTMLElement>(`[data-field-index="${this.fieldIndex}"]`)?.classList.add("is-revealed");
    this.fieldIndex = Math.min(this.fieldIndex + 1, 2);
  }

  private resetEnemies(): void {
    this.enemies.length = 0;
    ["bot", "spam", "ping", "ads"].forEach((label, index) => {
      this.enemies.push({ x: 100 + index * 130, y: 72 + (index % 2) * 48, hit: false, label });
    });
  }

  private launchConfetti(): void {
    const status = document.querySelector<HTMLElement>("#form-status");
    if (status) status.textContent = "Signal cleared. Contact channel is ready.";
    for (let i = 0; i < 28; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${randomRange(20, 80)}vw`;
      piece.style.top = `${randomRange(-10, 12)}vh`;
      piece.style.background = ["#00d4ff", "#ff2d9b", "#24e17a", "#ffd166"][i % 4];
      piece.style.setProperty("--dx", `${randomRange(-120, 120)}px`);
      document.body.append(piece);
      window.setTimeout(() => piece.remove(), 1000);
    }
  }
}

function setupGames(): void {
  const gameMap = new Map<Element, GameInstance>();
  const heroCanvas = document.querySelector<HTMLCanvasElement>("#hero-canvas");
  const pongCanvas = document.querySelector<HTMLCanvasElement>("#pong-canvas");
  const tetrisCanvas = document.querySelector<HTMLCanvasElement>("#tetris-canvas");
  const runnerCanvas = document.querySelector<HTMLCanvasElement>("#runner-canvas");
  const snakeCanvas = document.querySelector<HTMLCanvasElement>("#snake-canvas");
  const shooterCanvas = document.querySelector<HTMLCanvasElement>("#shooter-canvas");

  if (heroCanvas) gameMap.set(document.querySelector("#hero")!, new HeroWarp(heroCanvas));
  if (pongCanvas) gameMap.set(document.querySelector("#about")!, new PongGame(pongCanvas));
  if (tetrisCanvas) gameMap.set(document.querySelector("#skills")!, new TetrisGame(tetrisCanvas));
  if (runnerCanvas) gameMap.set(document.querySelector("#projects")!, new RunnerGame(runnerCanvas));
  if (snakeCanvas) gameMap.set(document.querySelector("#experience")!, new SnakeGame(snakeCanvas));
  if (shooterCanvas) gameMap.set(document.querySelector("#contact")!, new ShooterGame(shooterCanvas));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const game = gameMap.get(entry.target);
        if (!game) return;
        if (entry.isIntersecting) {
          game.start();
        } else {
          game.stop();
        }
      });
    },
    { threshold: 0.18 },
  );

  gameMap.forEach((game, section) => {
    game.resize?.();
    observer.observe(section);
  });

  window.addEventListener("resize", () => gameMap.forEach((game) => game.resize?.()));
}

function setupContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("#contact-form");
  const status = document.querySelector<HTMLElement>("#form-status");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`GameFolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    window.location.href = `mailto:${portfolio.email}?subject=${subject}&body=${body}`;
    if (status) status.textContent = "Opening your email app.";
  });
}

function boot(): void {
  setupLoader();
  renderApp();
  setupGlobalUi();
  setupControls();
  setupNav();
  setupGsap();
  drawRadar();
  animateSkillMeters(0.18);
  setupGames();
  setupContactForm();
}

boot();
