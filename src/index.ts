import React, { useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import onStateChange from "./onStateChange"

export type TypeEventCallback = (() => void) | (() => Promise<void>)
type TypeUseAppLifecycleParams = Partial<
  Record<"onLaunch" | "onFocus" | "onBlur", TypeEventCallback>
>

export function useAppLifecycle({
  onLaunch,
  onFocus,
  onBlur,
}: TypeUseAppLifecycleParams) {
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
