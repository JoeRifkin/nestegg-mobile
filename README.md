# NestEgg

A retirement-savings demo app built with React Native, Expo, and TypeScript. It shows how I approach a greenfield fintech mobile app: secure sign-in, real-time balances, careful money math, accessible UI, feature flags, and tests from day one.

> Demo only. All data is mocked and nothing here is financial advice.

## Features

| Area | What it does |
| --- | --- |
| **Biometric sign-in** | Face ID / Touch ID / fingerprint via `expo-local-authentication`, with passcode fallback. The session token is stored in the iOS Keychain / Android Keystore via `expo-secure-store`, never in AsyncStorage. |
| **Real-time balance** | TanStack Query polls the balance every 15 seconds, pauses in the background, retries on failure, and refetches on reconnect. Pull to refresh is supported. |
| **Contribution planner** | Change your contribution rate and see your yearly contribution, employer match, and projected balance at retirement. It warns you if you're below the full employer match. |
| **Optimistic updates** | Saving a new rate updates the UI right away and rolls back if the server rejects it. |
| **Two personas** | Participant tabs (Home, Contribute) plus a **Plan admin** tab with participation and to-dos, gated by a feature flag. |
| **Feature flags** | `adminView`, `contributionNudge`, and `liveBalances` gate staged work so it can ship dark and roll out gradually. |
| **Accessibility** | Screen-reader labels on every control, an adjustable rate stepper for VoiceOver and TalkBack, a plain-language summary for the chart, 44pt minimum touch targets, and live regions for changing values. |
| **Data visualization** | Lightweight balance chart drawn with `react-native-svg`. |
| **Haptics** | Selection haptics on rate changes. |

## Engineering decisions

- **Money is integer cents.** Floating-point math drifts (`0.1 + 0.2 !== 0.3`), so all balances are stored and calculated in cents.
- **Pure logic, separate from UI.** Projection, match, and IRS-limit math live in `src/lib/projection.ts` and are fully unit tested.
- **A typed API contract.** `src/api/client.ts` defines the request and response shapes the backend would share. The mock server adds latency, market drift, and optional failures so loading, error, and retry states are real.
- **Steppers over sliders.** For a financial input, precise +/- steps are easier to use and work better with screen readers than a slider.

## Project structure

```
app/                     Expo Router screens (file-based routing)
  (tabs)/                Home, Contribute, Plan admin
src/
  api/                   Typed client (mock server) and TanStack Query hooks
  components/            BalanceChart, RateStepper, Card
  features/              auth, dashboard, contributions, admin
  lib/                   money, projection math, feature flags
  theme/                 Design tokens
__tests__/               Jest + React Native Testing Library
.github/workflows/ci.yml Typecheck and tests on every push and PR
```

## Getting started

```bash
npm install
npx expo start        # press i for the iOS simulator or a for Android
npm run typecheck
npm test
```

Biometrics work on a real device or a simulator with Face ID enrolled (Features → Face ID → Enrolled).

## Roadmap

- End-to-end UI tests with Detox or Maestro
- Phased rollouts with EAS Build and Submit, plus OTA updates
- Crash and performance monitoring with Sentry
- Server-driven UI for the admin to-do list

## Tech

React Native · Expo (SDK 52) · Expo Router · TypeScript (strict) · TanStack Query · react-native-svg · expo-local-authentication · expo-secure-store · expo-haptics · Jest · React Native Testing Library · GitHub Actions

## Author

Joseph Rifkin · [linkedin.com/in/joseph-rifkin](https://www.linkedin.com/in/joseph-rifkin/)
