@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Inter:wght@100..900&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Newsreader", serif;
  --font-sans: "Inter", sans-serif;
}

:root {
  --gulliver-blue: #003087;
  --cinematic-bg: #fcfcfc;
  --cinematic-text: #121212;
  --cinematic-muted: #666666;
  --cinematic-border: rgba(0, 0, 0, 0.08);
}

@layer base {
  body {
    @apply bg-[var(--cinematic-bg)] text-[var(--cinematic-text)] font-sans antialiased;
    letter-spacing: -0.01em;
  }
}

@layer components {
  .a24-container {
    @apply max-w-7xl mx-auto px-8 md:px-12 lg:px-16;
  }

  .cinematic-card {
    @apply bg-white border border-[var(--cinematic-border)] p-8 transition-all duration-500 hover:shadow-[0_4px_30px_rgba(0,0,0,0.04)];
  }

  .film-grain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.03;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8ZmlsdGVyIGlkPSJub2lzZSI+CjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CjxmZUNvbG9yTWF0cml4IHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz4KPC9maWx0ZXI+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz4KPC9zdmc+');
  }

  .btn-raider {
    @apply bg-[var(--gulliver-blue)] text-white px-8 py-3 font-semibold uppercase tracking-widest text-[11px] transition-all hover:opacity-95 hover:scale-[1.01] active:scale-95 disabled:opacity-50;
  }

  .prestige-label {
    @apply font-serif italic text-sm text-[var(--cinematic-muted)];
  }

  .metric-label {
    @apply font-sans uppercase tracking-[0.2em] text-[10px] font-bold text-[var(--cinematic-muted)];
  }
}

.text-reveal {
  animation: reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1);
}

@keyframes reveal {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
