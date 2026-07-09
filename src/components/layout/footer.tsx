'use client';

import labels from '@/lib/labels.json';
import { toArabicNumerals } from '@/lib/shared/utils';

const socialLinks = [
  { 
    href: "https://www.facebook.com/nibras.mishkah", 
    label: "فيسبوك",
    defaultIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    coloredIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M24 12a12 12 0 1 0-13.875 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385A12 12 0 0 0 24 12z" fill="#1877F2"/>
      </svg>
    )
  },
  { 
    href: "https://www.youtube.com/@nibras_mishkah", 
    label: "يوتيوب",
    defaultIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
    coloredIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="#FF0000" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#FFFFFF" />
      </svg>
    )
  },
  { 
    href: "https://instagram.com/nibras_mishkah", 
    label: "إنستغرام",
    defaultIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    coloredIcon: (
      <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="130%">
            <stop offset="0%" stopColor="#FED373" />
            <stop offset="15%" stopColor="#F15245" />
            <stop offset="45%" stopColor="#D92E7F" />
            <stop offset="60%" stopColor="#9B36B7" />
            <stop offset="100%" stopColor="#515BD4" />
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF" />
      </svg>
    )
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-sm py-12 mt-24">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 text-muted-foreground">
            <div className="flex justify-center gap-4 mb-6">
            {socialLinks.map(({ coloredIcon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group relative w-12 h-12 rounded-full bg-card/50 border border-border/50 flex items-center justify-center shadow-sm transition-all duration-300 hover:bg-card hover:scale-110 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-border"
              >
                <span className="flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
                  {coloredIcon}
                </span>
              </a>
            ))}
            </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{labels.home.copyright}</p>
          <p className="text-xs text-muted-foreground/70">{toArabicNumerals(new Date().getFullYear())}</p> 
        </div>
      </div>
    </footer>
  );
}
