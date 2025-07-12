import type { 
  SiteConfig, 
  NavItem, 
  HeroContent, 
  AboutContent, 
  Project, 
  BlogPost, 
  Skill,
  TimelineItem 
} from './types';

export const SITE_CONFIG: SiteConfig = {
  name: 'Stars and Manifolds',
  title: 'Stars and Manifolds',
  description: 'Personal portfolio and blog of a software engineer with a background in Physics, Mathematics, and AI.',
  tagline: 'May your coffee kick in before reality does.',
  email: 'adyavanapalli@gmail.com',
  socialLinks: [
    { name: 'GitHub', href: 'https://github.com/adyavanapalli' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/adyavanapalli/' },
    { name: 'Email', href: 'mailto:adyavanapalli@gmail.com' }
  ]
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
  { label: 'Skills', href: '/skills' }
];

export const HERO_CONTENT: HeroContent = {
  greeting: 'Hello, I\'m',
  name: 'Anand',
  title: 'Software Engineer',
  tagline: 'May your coffee kick in before reality does.',
  ctaText: 'View My Work',
  ctaHref: '/projects'
};

export const ABOUT_CONTENT: AboutContent = {
  title: 'About Me',
  paragraphs: [
    'Fullstack software engineer with strong problem-solving skills, experience developing on large code bases, and a background in Physics, Mathematics, and AI.',
    'I enjoy tackling complex technical challenges and building robust, scalable solutions. My diverse background in sciences and engineering helps me approach problems from unique perspectives.',
    'Currently focused on building high-performance systems and exploring the intersection of software engineering with my academic foundations.'
  ]
};

export const PROJECTS: Project[] = [
  {
    title: 'MdnsListener',
    description: 'A high-performance, production-ready multicast DNS (mDNS) listener built with .NET, designed to discover and monitor services on the local network using the mDNS protocol (RFC 6762).',
    technologies: ['C#', '.NET', 'mDNS', 'Networking'],
    githubUrl: 'https://github.com/adyavanapalli/MdnsListener'
  }
];

export const SKILLS: Skill[] = [
  // Languages
  { name: 'C#', category: 'language', proficiency: 'expert' },
  { name: 'C', category: 'language', proficiency: 'advanced' },
  { name: 'C++', category: 'language', proficiency: 'advanced' },
  { name: 'JavaScript', category: 'language', proficiency: 'advanced' },
  { name: 'Python', category: 'language', proficiency: 'advanced' },
  { name: 'Kotlin', category: 'language', proficiency: 'intermediate' },
  
  // Frameworks & Technologies
  { name: '.NET', category: 'framework', proficiency: 'expert' },
  { name: 'React', category: 'framework', proficiency: 'advanced' },
  { name: 'Svelte', category: 'framework', proficiency: 'intermediate' },
  
  // Other
  { name: 'Physics', category: 'other', proficiency: 'advanced' },
  { name: 'Mathematics', category: 'other', proficiency: 'advanced' },
  { name: 'AI/ML', category: 'other', proficiency: 'intermediate' }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Building High-Performance mDNS Services with .NET',
    date: '2024-01-15',
    excerpt: 'A deep dive into implementing multicast DNS services using .NET, exploring performance optimizations and real-world applications.',
    slug: 'mdns-services-dotnet',
    tags: ['C#', '.NET', 'Networking', 'mDNS']
  },
  {
    title: 'The Intersection of Physics and Software Engineering',
    date: '2024-01-08',
    excerpt: 'How principles from physics can inform better software design patterns and help us build more robust systems.',
    slug: 'physics-software-engineering',
    tags: ['Physics', 'Software Design', 'Theory']
  },
  {
    title: 'Modern C++ in Systems Programming',
    date: '2023-12-20',
    excerpt: 'Exploring modern C++ features and their applications in high-performance systems programming.',
    slug: 'modern-cpp-systems',
    tags: ['C++', 'Systems Programming', 'Performance']
  }
];

export const TIMELINE: TimelineItem[] = [
  // Professional timeline will be added here when needed
];