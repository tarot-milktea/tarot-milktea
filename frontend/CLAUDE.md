# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm install` - Install dependencies

### Build & Quality
- `npm run build` - Type check and build for production (runs `tsc -b && vite build`)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

### Navigation System
This React app uses a hybrid routing approach:
- **OnboardingFlow**: Uses useState to navigate between onboarding pages (1-5), card draw, and loading
- **ResultPage**: Uses React Router with dynamic routes (`/result/:resultId`)
- Results are stored in localStorage with generated IDs

### Color System
Sophisticated theming system with CSS variables and TypeScript types:
- **Color Palettes**: primary (purple), accent (yellow), gold, neutral, success, error, warning, info
- **Semantic Colors**: background, card, text, button variations, result indicators
- **Theme Support**: Dark mode (default) and light mode via `data-theme` attribute
- **useColors Hook**: Provides type-safe access to colors, gradients, shadows, transitions
- **Color Utils**: Helper functions for generating CSS variable names and combinations

### Component Structure
```
src/
├── components/OnboardingFlow/ - Main navigation controller with theme toggle
├── pages/ - Individual page components (Onboarding1-5, CardDraw, Loading, Result)
├── hooks/useColors.ts - Color system hook with theme management
├── types/colors.ts - TypeScript definitions for color system
├── utils/colorUtils.ts - Color utility functions
└── assets/ - CSS files (colors.css, fonts.css) and other assets
```

### Key Technical Details
- **React 19** with TypeScript and Vite
- **Pretendard** font family loaded via CSS
- **CSS Modules** for component styling
- **Color Variables**: Comprehensive CSS custom property system with 50-900 scales
- **Result Handling**: Temporary storage in localStorage before routing to result page

The color system is the most complex part of the architecture - it provides a complete design system with type safety, theme switching, and predefined style combinations for consistent UI development.