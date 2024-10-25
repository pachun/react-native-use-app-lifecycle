import React, { useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

export type TypeEventCallback = (() => void) | (() => Promise<void>)
type TypeUseAppLifecycleParams = Partial<
  Record<"onLaunch" | "onFocus" | "onBlur", TypeEventCallback>
>

export function useAppLifecycle({
  onLaunch,
  onFocus,
  onBlur,
}: TypeUseAppLifecycleParams) {
  const onLaunchRef = useRef(onLaunch)
  const onBlurRef = useRef(onBlur)
  const onFocusRef = useRef(onFocus)
  React.useEffect(() => {
    onLaunchRef.current?.()
  }, [])

  React.useEffect(() => {
    function _handlerAppStateChange(state: AppStateStatus) {
      if (state === "inactive" || state === "background") onBlurRef.current?.()
      if (state === "active") onFocusRef.current?.()
    }
    const subscription = AppState.addEventListener(
      "change",
      _handlerAppStateChange,
    )

    return () => {
      subscription.remove()
    }
  }, [])
}
