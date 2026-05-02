export interface Skill {
  name: string;
  value: number;
  color: string;
}

export interface Project {
  title: string;
  summary: string;
  stack: string[];
  liveUrl: string;
  sourceUrl: string;
  accent: string;
}

export interface Experience {
  year: string;
  role: string;
  company: string;
  summary: string;
}

export const portfolio = {
  name: "Siddhartha",
  role: "Creative Frontend Developer",
  tagline: "I build fast, playful web experiences where product craft and real engineering meet.",
  email: "hello@example.com",
  location: "India",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Resume", href: "#" },
  ],
  stats: [
    { label: "Canvas Games", value: "06" },
    { label: "Target FPS", value: "60" },
    { label: "Static Build", value: "01" },
  ],
  about:
    "I turn interface ideas into polished, high-performance frontends. My favorite work sits where animation, systems thinking, accessibility, and product clarity overlap.",
  values: ["Fast feedback", "Readable systems", "Motion with purpose", "Mobile-first play"],
  skills: [
    { name: "TypeScript", value: 94, color: "#00d4ff" },
    { name: "React", value: 88, color: "#6c3de1" },
    { name: "Canvas", value: 90, color: "#24e17a" },
    { name: "CSS", value: 92, color: "#ff2d9b" },
    { name: "Node", value: 82, color: "#ffd166" },
    { name: "UX Motion", value: 86, color: "#ff7a3d" },
  ] satisfies Skill[],
  projects: [
    {
      title: "Arcade Analytics",
      summary: "A dashboard that turns live product telemetry into glanceable, game-like levels.",
      stack: ["TypeScript", "Canvas", "Charts"],
      liveUrl: "#",
      sourceUrl: "#",
      accent: "#00d4ff",
    },
    {
      title: "Pixel Planner",
      summary: "A tactile task board with keyboard-first workflows, drag physics, and local persistence.",
      stack: ["Vite", "State", "A11y"],
      liveUrl: "#",
      sourceUrl: "#",
      accent: "#24e17a",
    },
    {
      title: "Shader Shop",
      summary: "A landing experience with lazy WebGL, fallback canvases, and measurable Core Web Vitals.",
      stack: ["Three.js", "GSAP", "Perf"],
      liveUrl: "#",
      sourceUrl: "#",
      accent: "#ff2d9b",
    },
  ] satisfies Project[],
  secretProject: {
    title: "Secret Boss Room",
    summary: "A hidden case study for recruiters who chase the high score.",
    stack: ["Game UX", "Delight", "Systems"],
    liveUrl: "#",
    sourceUrl: "#",
    accent: "#ffd166",
  } satisfies Project,
  experience: [
    {
      year: "2022",
      role: "Frontend Engineer",
      company: "Product Studio",
      summary: "Built reusable UI systems, improved performance budgets, and shipped rich dashboard workflows.",
    },
    {
      year: "2023",
      role: "Creative Developer",
      company: "Interactive Lab",
      summary: "Delivered canvas experiments, scroll-driven pages, and polished motion systems for launches.",
    },
    {
      year: "2024",
      role: "Full-Stack Collaborator",
      company: "Startup Sprint",
      summary: "Connected product prototypes to real APIs while keeping the frontend fast and accessible.",
    },
    {
      year: "2025",
      role: "Independent Builder",
      company: "GameFolio",
      summary: "Focused on memorable portfolio products, static deployments, and playful technical storytelling.",
    },
  ] satisfies Experience[],
};
