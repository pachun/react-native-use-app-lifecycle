import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

const blurredStates = ["inactive", "background"]
const isBlurred = (state: AppStateStatus) => blurredStates.includes(state)

export type OnLaunch = () => void
export type OnFocus = () => void
export type OnBlur = () => void

export const onFocusDebounceMilliseconds = 100

const useAppLifecycle = ({
  onLaunch,
  onFocus,
  onBlur,
}: {
  onLaunch?: OnLaunch
  onFocus?: OnFocus
  onBlur?: OnBlur
}) => {
  const hasLaunched = useRef(false)

  useEffect(() => {
    if (!hasLaunched.current) {
      hasLaunched.current = true
      onLaunch?.()
    }
  }, [onLaunch])

  const previousAppState = useRef<AppStateStatus>(AppState.currentState)
  const onFocusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (
        onFocus &&
        isBlurred(previousAppState.current) &&
        state === "active"
      ) {
        clearTimeout(onFocusTimer.current)
        onFocusTimer.current = setTimeout(onFocus, onFocusDebounceMilliseconds)
      }

      if (previousAppState.current === "active" && isBlurred(state)) {
        onBlur?.()
      }
      previousAppState.current = state
    })

    return () => {
      subscription.remove()
      clearTimeout(onFocusTimer.current)
    }
  }, [onFocus, onBlur])
}

export default useAppLifecycle
