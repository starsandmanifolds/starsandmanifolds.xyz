export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

export interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  tags: string[];
  state: "draft" | "published";
  content?: any; // Svelte component for rendered markdown
}

export interface Skill {
  name: string;
  category: "language" | "framework" | "tool" | "other";
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  type: "work" | "education" | "achievement";
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  tagline: string;
  email: string;
  socialLinks: SocialLink[];
}

export interface HeroContent {
  greeting: string;
  name: string;
  title: string;
  tagline: string;
  ctaText: string;
  ctaHref: string;
}

export interface AboutContent {
  title: string;
  paragraphs: string[];
  imageUrl?: string;
}
