import { renderHook, act } from "@testing-library/react-hooks"
import { AppState, AppStateStatus } from "react-native"
import useAppLifecycle from "../src/index"

const captureAppStateChanges = () => {
  const handlers: ((state: AppStateStatus) => void)[] = []
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_event, handler) => {
      handlers.push(handler)
      return { remove: jest.fn() }
    })
  return (state: AppStateStatus) =>
    act(() => {
      for (const handler of handlers) {
        handler(state)
      }
    })
}

const flushDebounce = () => act(() => jest.runAllTimers())

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe("useAppLifecycle", () => {
  it("calls onLaunch when the app launches", () => {
    const onLaunch = jest.fn()

    renderHook(() => useAppLifecycle({ onLaunch }))

    expect(onLaunch).toHaveBeenCalledTimes(1)
  })

  it("does not call onLaunch again when the app re-renders", () => {
    const onLaunch = jest.fn()

    const { rerender } = renderHook(() => useAppLifecycle({ onLaunch }))
    rerender()

    expect(onLaunch).toHaveBeenCalledTimes(1)
  })

  it("calls onLaunch once even when the onLaunch prop changes", () => {
    const firstOnLaunch = jest.fn()
    const secondOnLaunch = jest.fn()

    const { rerender } = renderHook(
      ({ onLaunch }) => useAppLifecycle({ onLaunch }),
      { initialProps: { onLaunch: firstOnLaunch } },
    )
    rerender({ onLaunch: secondOnLaunch })

    expect(firstOnLaunch).toHaveBeenCalledTimes(1)
    expect(secondOnLaunch).not.toHaveBeenCalled()
  })

  it("calls onFocus when the app returns to the foreground", () => {
    const onFocus = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onFocus }))
    fireAppStateChange("background")
    fireAppStateChange("active")
    flushDebounce()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("does not call onFocus again while the app stays active", () => {
    const onFocus = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onFocus }))
    fireAppStateChange("background")
    fireAppStateChange("active")
    fireAppStateChange("active")
    flushDebounce()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("calls onBlur when the app goes to the background", () => {
    const onBlur = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onBlur }))
    fireAppStateChange("active")
    fireAppStateChange("background")

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it("calls onBlur when the app becomes inactive", () => {
    const onBlur = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onBlur }))
    fireAppStateChange("active")
    fireAppStateChange("inactive")

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it("does not blur when the app state becomes unknown", () => {
    const onBlur = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onBlur }))
    fireAppStateChange("active")
    fireAppStateChange("unknown")

    expect(onBlur).not.toHaveBeenCalled()
  })

  it("does not focus when returning to active from an unknown state", () => {
    const onFocus = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onFocus }))
    fireAppStateChange("unknown")
    fireAppStateChange("active")
    flushDebounce()

    expect(onFocus).not.toHaveBeenCalled()
  })

  it("debounces onFocus across rapid foreground returns", () => {
    const onFocus = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    renderHook(() => useAppLifecycle({ onFocus }))
    fireAppStateChange("background")
    fireAppStateChange("active")
    fireAppStateChange("background")
    fireAppStateChange("active")

    expect(onFocus).not.toHaveBeenCalled()

    flushDebounce()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("does not call onFocus if unmounted before the debounce settles", () => {
    const onFocus = jest.fn()
    const fireAppStateChange = captureAppStateChanges()

    const { unmount } = renderHook(() => useAppLifecycle({ onFocus }))
    fireAppStateChange("background")
    fireAppStateChange("active")
    unmount()
    flushDebounce()

    expect(onFocus).not.toHaveBeenCalled()
  })

  it("stops listening to app state changes when unmounted", () => {
    const remove = jest.fn()
    jest.spyOn(AppState, "addEventListener").mockReturnValue({ remove })

    const { unmount } = renderHook(() => useAppLifecycle({}))
    unmount()

    expect(remove).toHaveBeenCalledTimes(1)
  })
})
