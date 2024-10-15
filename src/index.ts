// lines marked "unappealing" exist for testing purposes
// We don't love them, but they're the best way we've found to test the useAppLifecycle hook

import React from "react"
import { AppState, AppStateStatus } from "react-native"

type onLaunch = (() => void) | (() => Promise<void>)
type onFocus = (() => void) | (() => Promise<void>)
type onBlur = (() => void) | (() => Promise<void>)
type onStateChange = (
  previousAppState: AppStateStatus,
) => (currentAppState: AppStateStatus) => void

const isFocused = (appState: string): boolean => {
  return appState === "active"
}

const isBlurred = (appState: string): boolean => {
  return appState === "inactive" || appState === "background"
}

const useAppLifecycle = (
  {
    onLaunch,
    onFocus,
    onBlur,
  }: {
    onLaunch?: onLaunch
    onFocus?: onFocus
    onBlur?: onBlur
  },
  // unappealing start
  injectedOnStateChangeForTesting?: onStateChange,
  // unappealing end
) => {
  const [hasLaunched, setHasLaunched] = React.useState(false)

  React.useEffect(() => {
    if (!hasLaunched && onLaunch) {
      setHasLaunched(true)
      onLaunch()
    }
  }, [hasLaunched, onLaunch])

  const [previousAppState, setPreviousAppState] =
    React.useState<AppStateStatus>(AppState.currentState)

  React.useEffect(() => {
    const onStateChange =
      (previousAppState: AppStateStatus) =>
      (currentAppState: AppStateStatus) => {
        if (
          onFocus &&
          isBlurred(previousAppState) &&
          isFocused(currentAppState)
        ) {
          onFocus()
        }

        if (
          onBlur &&
          isFocused(previousAppState) &&
          isBlurred(currentAppState)
        ) {
          onBlur()
        }

        setPreviousAppState(currentAppState)
      }

    // unappealing start
    if (__DEV__) {
      ;(global as any).onStateChange = onStateChange
    }
    // unappealing end

    const subscription = AppState.addEventListener(
      "change",
      // unappealing start
      injectedOnStateChangeForTesting ?? onStateChange(previousAppState),
      // unappealing end
    )

    return () => {
      subscription.remove()

      // unappealing start
      if (__DEV__) {
        delete (global as any).onStateChange
      }
      // unappealing end
    }
  }, [onFocus, onBlur, previousAppState, injectedOnStateChangeForTesting])
}

export default useAppLifecycle
