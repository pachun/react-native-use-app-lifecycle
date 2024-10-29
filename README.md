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

I've been copying and pasting this code into all my RN projects for a long time. Usually, I use it [to check for and download Over-The-Air (OTA) expo updates](https://docs.expo.dev/versions/latest/sdk/updates/).

## Contributing

PRs are exciting 🤟 Bump the version number in `package.json` and open some.

- Please do not submit AI generated pull requests.
- Please keep coverage at or above where it is when you clone the repo (`yarn test --collectCoverage`).
