import { renderHook } from "@testing-library/react-hooks"
import { AppState } from "react-native"
import useAppLifecycle from "../src/index"
import launchTheApp from "../src/testing"

const millisecondsForTheFocusDebounceToSettle = 150

const waitForTheFocusDebounceToSettle = () =>
  new Promise(resolve =>
    setTimeout(resolve, millisecondsForTheFocusDebounceToSettle),
  )

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe("launchTheApp", () => {
  it("runs onLaunch", () => {
    const onLaunch = jest.fn()

    launchTheApp(() => renderHook(() => useAppLifecycle({ onLaunch })))

    expect(onLaunch).toHaveBeenCalledTimes(1)
  })

  it("launches into the foreground", () => {
    launchTheApp(() => renderHook(() => useAppLifecycle({})))

    expect(AppState.currentState).toBe("active")
  })

  it("runs onBlur when the app is backgrounded", () => {
    const onBlur = jest.fn()

    const { backgroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({ onBlur })),
    )
    backgroundTheApp()

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it("runs onFocus when the app is foregrounded", async () => {
    const onFocus = jest.fn()

    const { backgroundTheApp, foregroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({ onFocus })),
    )
    backgroundTheApp()
    foregroundTheApp()

    await waitForTheFocusDebounceToSettle()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("settles the focus debounce when tests use fake timers", () => {
    jest.useFakeTimers()
    const onFocus = jest.fn()

    const { backgroundTheApp, foregroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({ onFocus })),
    )
    backgroundTheApp()
    foregroundTheApp()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("settles the focus debounce when tests use legacy fake timers", () => {
    jest.useFakeTimers({ legacyFakeTimers: true })
    const onFocus = jest.fn()

    const { backgroundTheApp, foregroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({ onFocus })),
    )
    backgroundTheApp()
    foregroundTheApp()

    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it("refuses to background an app that is already backgrounded", () => {
    const { backgroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({})),
    )
    backgroundTheApp()

    expect(backgroundTheApp).toThrow(
      "Can't background the app because it's already backgrounded.",
    )
  })

  it("refuses to foreground an app that is already in the foreground", () => {
    const { foregroundTheApp } = launchTheApp(() =>
      renderHook(() => useAppLifecycle({})),
    )

    expect(foregroundTheApp).toThrow(
      "Can't foreground the app because it's already in the foreground. Background it first with backgroundTheApp().",
    )
  })

  it("stops sending app state changes to unmounted components", () => {
    const onBlur = jest.fn()

    const { backgroundTheApp } = launchTheApp(() => {
      const { unmount } = renderHook(() => useAppLifecycle({ onBlur }))
      unmount()
    })
    backgroundTheApp()

    expect(onBlur).not.toHaveBeenCalled()
  })
})
