import { AppStateStatus } from "react-native"
import { OnBlur, OnFocus } from "./index"

const isFocused = (appState: AppStateStatus): boolean => {
  return appState === "active"
}

const isBlurred = (appState: AppStateStatus): boolean => {
  return appState === "inactive" || appState === "background"
}

const onStateChange =
  (
    previousAppState: AppStateStatus,
    setPreviousAppState: React.Dispatch<React.SetStateAction<AppStateStatus>>,
    onFocus?: OnFocus,
    onBlur?: OnBlur,
  ) =>
  (currentAppState: AppStateStatus) => {
    if (onFocus && isBlurred(previousAppState) && isFocused(currentAppState)) {
      onFocus()
    }

    if (onBlur && isFocused(previousAppState) && isBlurred(currentAppState)) {
      onBlur()
    }

    setPreviousAppState(currentAppState)
  }

export default onStateChange
