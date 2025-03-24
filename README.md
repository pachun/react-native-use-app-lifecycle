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

## Motivation

Test driving code is nice. Writing tests for [ref code](https://reactnative.dev/docs/appstate) sucks. Use this package to avoid TDDing ref code and improve the readability of your tests _a little bit_.

I use this package [to check for and download Over-The-Air (OTA) expo updates](https://github.com/pachun/simple-expo-update).

## Tests

```tsx
import { renderRouter, act } from "expo-router/testing-library"
import useAppLifecycle from "@pachun/react-native-use-app-lifecycle"

jest.mock("@pachun/react-native-use-app-lifecycle", () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe("foregrounding the application", () => {
  it("does stuff", async () => {
    let triggerAppForeground
    jest.mocked(useAppLifecycle).mockImplementation(({ onFocus }) => {
      triggerAppForeground = onFocus
    })

    renderRouter("src/app", { initialUrl: "/" })

    await act(() => triggerAppForeground!)

    // expect stuff
  })
})
```

## Contributing

PRs are exciting 🤟 Bump the version number in `package.json` and open one.

- Please do not submit AI generated pull requests.
- Please keep coverage at or above where it is when you clone the repo (`yarn test --collectCoverage`).
