# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm**.

- `pnpm install` — install deps
- `pnpm start` — `expo start` (dev). Also `pnpm android` / `pnpm ios` / `pnpm web`
- `pnpm lint` — `expo lint` (ESLint flat config, `eslint-config-expo`)
- `pnpm run reset-project` — **destructive**: reverts app/ to the create-expo-app template scaffold. Do not run unless explicitly intended.

No test runner is configured.

## Stack

Expo SDK **54** (`~54.0.35`), React Native **0.81.5**, React **19.1**, New Architecture on. `app.json` enables `experiments.typedRoutes` and `reactCompiler`. TS `strict`.

## Routing (expo-router v6, file-based)

- `app/_layout.tsx` — root `<Stack>` with global `headerShown: false`.
- Route groups: `(auth)` and `(tabs)`, each with their own `_layout.tsx`.
- `(tabs)/_layout.tsx` — bottom `<Tabs>` configured from a `tabs` array (Home / Settings / Places). Dynamic route `place/[id]` is hidden from the tab bar via `href: null`. Add tabs there, not as loose files.
- `useLocalSearchParams<{ id: string }>()` for dynamic params.

## Styling (NativeWind v5 preview + Tailwind v4)

This is the non-obvious part. Almost all styling is **CSS-class-based**, not inline `className="flex p-4 ..."` utilities.

- All styles live in `assets/global.css`:
  - `@theme` block defines design tokens: colors (`--color-primary`, `--color-accent`, `--color-card`, `--color-place`, etc.), spacing scale, and font families (`--font-sans` → `sans-regular`, etc.).
  - `@layer components` defines named component classes grouped by feature: `.home-*`, `.sub-*`, `.auth-*`, `.modal-*`, `.tabs-*`.category-*`. Compose with `@apply`.
- Components reference these by class name, e.g. `className="place-card"` / `className="input"`.
- **Add new reusable styles as a component class in `global.css`**, then apply the class name. Reach for utility classes inline only for one-off tweaks.
- Conditional class toggling uses the `cn()` helper (`lib/utils.ts`, clsx + tailwind-merge), e.g. `cn("tabs-pill", focused && "tabs-active")`.

Wiring: `metro.config.js` wraps the Metro config with `withNativeWind({ input: './assets/global.css' })`; `postcss.config.mjs` uses `@tailwindcss/postcss`; `assets/global.css` is imported once in the root layouts.

## Path alias

`@/*` → repo root (`tsconfig.json` paths). Import app code as `@/lib/utils`, `@/constants/icons`, `@/assets/global.css`.

## Conventions

- Images: use `expo-image` (`import { Image } from "expo-image"`), not RN `Image`.
- Icons: import from `constants/icons.ts` (PNG assets). It exports the `icons` map and an `IconKey` type — the `(tabs)` layout's `tabs` array is `satisfies TabScreen[]` against it. Add new PNGs there. Same pattern for images in `constants/images.ts`.
- Formatting/domain helpers live in `lib/utils.ts` (`formatCurrency`, `formatDateTime`, `formatStatusLabel`, `cn`).
- Fonts: `global.css` `@theme` maps `--font-sans-*` to family names (`sans-regular` … `sans-extrabold`); the TTFs are in `assets/fonts/PlusJakartaSans-*.ttf`. No `expo-font` loader is wired into the layouts yet — add `useFonts` in a root layout if you start using `font-sans-*` classes.

## UI style

- Custom base UI components in `components/ui`, like `Button`, `Modal`, plain `Text` and etc.. Any new one should be put there.
- Shared components in just `components` like `ScreenBase`

## Backend/API

- DB: uses `Firebase Firestore`.
- Auth: uses `Firebase Auth` for both *email/password* and *Google* sign-in
- Uploaded images: uses `Claudinary` for images for a place
- Maps: `react-native-maps` - both `Google Maps for Android` and `Google Maps for iOS` APIs are enabled and proper API keys are created and saved in to `.env`
