import React from "react"
import { AppState } from "react-native"
import { renderHook } from "@testing-library/react-hooks"
import useAppLifecycle from "../src/index"
import * as onStateChangeExports from "../src/onStateChange"

describe("useAppLifecycle({ onLaunch, onFocus, onBlur })", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("calls onLaunch when the app is launched", () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    const originalOnLaunch = jest.fn()

    const { rerender } = renderHook(
      ({ onLaunch }) => useAppLifecycle({ onLaunch, onFocus, onBlur }),
      { initialProps: { onLaunch: originalOnLaunch, onFocus, onBlur } },
    )

    expect(originalOnLaunch).toHaveBeenCalledTimes(1)

    const updatedOnLaunch = jest.fn()

    rerender({ onLaunch: updatedOnLaunch, onFocus, onBlur })

    expect(updatedOnLaunch).not.toHaveBeenCalled()

    expect(onFocus).not.toHaveBeenCalled()
    expect(onBlur).not.toHaveBeenCalled()
  })

  it("listens to app state changes", () => {
    const initialCurrentState = "active"
    Object.defineProperty(AppState, "currentState", {
      value: initialCurrentState,
      configurable: true,
    })

    const setPreviousAppState = jest.fn()
    const originalUseState = React.useState
    const useStateSpy = jest.spyOn(React, "useState")
    useStateSpy.mockImplementation(initialValue => {
      if (initialValue === initialCurrentState) {
        return [initialCurrentState, setPreviousAppState]
      }
      return originalUseState(initialValue)
    })

    const onFocus = jest.fn()
    const onBlur = jest.fn()
    const expectedAppStateChangeListener = jest.fn()
    jest.spyOn(onStateChangeExports, "default").mockImplementation(
      // @ts-ignore
      (
        previousAppState,
        setPreviousAppStateParam,
        onFocusParam,
        onBlurParam,
      ) => {
        if (
          previousAppState === initialCurrentState &&
          setPreviousAppState === setPreviousAppStateParam &&
          onFocus === onFocusParam &&
          onBlur === onBlurParam
        ) {
          return expectedAppStateChangeListener
        }
      },
    )

    const appStateAddEventListenerSpy = jest.spyOn(AppState, "addEventListener")

    renderHook(() => useAppLifecycle({ onFocus: onFocus, onBlur: onBlur }))

    expect(appStateAddEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expectedAppStateChangeListener,
    )
  })

  it("stops listening to app state changes", () => {
    const removeSpy = jest.fn()
    jest.spyOn(AppState, "addEventListener").mockImplementation(() => ({
      remove: removeSpy,
    }))

    const { unmount } = renderHook(() => useAppLifecycle({}))

    unmount()

    expect(removeSpy).toHaveBeenCalled()
  })
})
