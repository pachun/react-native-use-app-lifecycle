[![npm version](https://img.shields.io/npm/v/@pachun/react-native-use-app-lifecycle.svg)](https://www.npmjs.com/package/@pachun/react-native-use-app-lifecycle)
[![cov](https://pachun.github.io/react-native-use-app-lifecycle/badges/coverage.svg)](https://github.com/pachun/react-native-use-app-lifecycle/actions)

# useAppLifecycle

A react native hook to run code when your app is launched, focused and blurred.

## Install

```sh
yarn add @pachun/react-native-use-app-lifecycle
```

## Usage

In your topmost-level component:

```tsx
import useAppLifecycle from "@pachun/react-native-use-app-lifecycle"

const App = () => {
  useAppLifecycle({
    onLaunch: () => console.log("launch"),
    onFocus: () => console.log("focus"),
    onBlur: () => console.log("blur"),
  })

  return <></>
}

export default App
```

`onLaunch` runs once, when the hook first mounts. `onFocus` and `onBlur` run on the
transitions to and from the foreground — and `onFocus` is debounced ~100ms, so a burst
of blur/focus events (a lock-screen flicker, Control Center) fires it once.

> [!TIP]
> I use this package [to check for and download Over-The-Air (OTA) expo updates](https://github.com/pachun/simple-expo-update).

## Motivation

[ref code](https://reactnative.dev/docs/appstate) ruins behavior driven development. Use this package to make your tests tell a coherent story.

## Tests

```tsx
import { renderRouter, waitFor, screen } from "expo-router/testing-library"
import launchTheApp from "@pachun/react-native-use-app-lifecycle/testing"

describe("foregrounding the application", () => {
  it("refreshes the inbox", async () => {
    const { backgroundTheApp, foregroundTheApp } = launchTheApp(() =>
      renderRouter("src/app", { initialUrl: "/" }),
    )

    backgroundTheApp()
    foregroundTheApp()

    await waitFor(() => expect(screen.getByText("1 new email")).toBeTruthy())
  })
})
```

`launchTheApp` takes whatever renders your app; `renderRouter`, `render`,
`renderHook`.

> [!NOTE]
> It's jest-only, and it uses `act` from `@testing-library/react-native` — which
> you already have if you're testing with `expo-router/testing-library`.

## Contributing

PRs are exciting 🤟 Bump the version number in `package.json` and open one.

- Please keep coverage at or above where it is when you clone the repo (`yarn test --collectCoverage`).
