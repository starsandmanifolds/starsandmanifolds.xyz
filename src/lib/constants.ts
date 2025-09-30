import type {
  SiteConfig,
  NavItem,
  HeroContent,
  AboutContent,
  Project,
  BlogPost,
  TimelineItem,
} from "./types";

export const SITE_URL = "https://starsandmanifolds.xyz";

export const SITE_CONFIG: SiteConfig = {
  name: "Stars and Manifolds",
  title: "Stars and Manifolds",
  description:
    "Personal portfolio and blog of a software engineer with a background in Physics, Mathematics, and AI.",
  tagline: "May your coffee kick in before reality does.",
  email: "adyavanapalli@gmail.com",
  socialLinks: [
    { name: "GitHub", href: "https://github.com/adyavanapalli" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/adyavanapalli/" },
    { name: "Email", href: "mailto:adyavanapalli@gmail.com" },
  ],
};

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
];

export const HERO_CONTENT: HeroContent = {
  greeting: "Hello, I'm",
  name: "Anand",
  title: "Software Engineer",
  tagline: "May your coffee kick in before reality does.",
  ctaText: "View My Work",
  ctaHref: "/projects",
};

export const ABOUT_CONTENT: AboutContent = {
  title: "About Me",
  paragraphs: [
    "I'm a software engineer with a background in Physics, Mathematics, and AI. I spend my days writing code and solving technical problems, but what really gets me excited is building things that make life easier for people I care about.",
    "Beyond software, I'm into DIY projects, electronics, and inventing things. There's something deeply satisfying about taking an idea, tinkering with it until it works, and seeing someone actually use it. Whether it's a CLI tool that helps my wife with her doctorate, a WhatsApp chatbot that handles the errands my parents keep bugging me about, or a hardware project that solves a small annoyance, I love that moment when something you built actually helps.",
    "I approach problems from different angles thanks to my background in sciences and engineering. And honestly, most of what I build starts as play, me nerding out over something interesting, and it just happens to turn into something useful.",
  ],
};

export const TIMELINE: TimelineItem[] = [
  // Professional timeline will be added here when needed
];
