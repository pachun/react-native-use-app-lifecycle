import React, { useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import onStateChange from "./onStateChange"

export type OnLaunch = (() => void) | (() => Promise<void>)
export type OnFocus = (() => void) | (() => Promise<void>)
export type OnBlur = (() => void) | (() => Promise<void>)

const useAppLifecycle = ({
  onLaunch,
  onFocus,
  onBlur,
}: {
  onLaunch?: OnLaunch
  onFocus?: OnFocus
  onBlur?: OnBlur
}) => {
  const onLaunchMemorized = useRef(onLaunch)
  React.useEffect(() => {
    onLaunchMemorized.current?.()
  }, [onLaunchMemorized])

  const [previousAppState, setPreviousAppState] =
    React.useState<AppStateStatus>(AppState.currentState)

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      onStateChange(previousAppState, setPreviousAppState, onFocus, onBlur),
    )

    return () => {
      subscription.remove()
    }
  }, [onFocus, onBlur, previousAppState])
}

export default useAppLifecycle
