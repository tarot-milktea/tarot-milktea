# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Vite development server (runs on http://localhost:5173)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality checks

### Setup
- `npm install` - Install all dependencies

## Architecture Overview

This is a React + TypeScript frontend application built with Vite, designed as a tarot card reading web application with onboarding flow and theming system.

### Key Architectural Patterns

**State-Based Navigation Flow**: The app uses a unique hybrid routing approach:
- Root level routing handled by React Router (`/` and `/result/:resultId`)
- Onboarding flow managed internally with useState in `OnboardingFlow` component
- Results stored in localStorage with generated IDs for routing

**Custom Color System**: 
- Centralized theme management through `useColors` hook
- Supports light/dark themes with color palette definitions
- Color utilities in `src/utils/colorUtils.ts` and types in `src/types/colors.ts`

**Component Architecture**:
- `OnboardingFlow` acts as a state machine managing multiple onboarding pages
- Page navigation for development testing built into the flow component
- TarotCard component with rotation/orientation capabilities

### State Management
- Zustand store for card-related state (`src/store/cardStore.ts`)
- React hooks for color theme management (`src/hooks/useColors.ts`)
- localStorage for persisting tarot results between sessions

### Technology Stack
- React 19 with TypeScript
- Vite for build tooling
- Emotion for CSS-in-JS styling
- React Router for page routing
- Zustand for state management
- Pretendard font integration

### Development Notes
- ESLint configured with TypeScript and React rules
- Hot reload enabled through Vite
- Development page navigation included in OnboardingFlow for testing
- No test framework currently configured