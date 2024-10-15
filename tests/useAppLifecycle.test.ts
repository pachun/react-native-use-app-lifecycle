import { AppState } from "react-native"
import { renderHook } from "@testing-library/react-hooks"
import useAppLifecycle from "../src/index"
import { act } from "@testing-library/react-native"

describe("useAppLifecycle({ onLaunch, onFocus, onBlur })", () => {
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
    const spy = jest.spyOn(AppState, "addEventListener")
    const injectedOnStateChangeForTesting = jest.fn()

    renderHook(() => useAppLifecycle({}, injectedOnStateChangeForTesting))

    expect(spy).toHaveBeenCalledWith("change", injectedOnStateChangeForTesting)
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

  it("calls onFocus when the app is focused", async () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()

    renderHook(() => useAppLifecycle({ onFocus, onBlur }))

    const onStateChange = (global as any).onStateChange

    await act(async () => {
      onStateChange("inactive")("active")

      expect(onFocus).toHaveBeenCalledTimes(1)

      onStateChange("background")("active")

      expect(onFocus).toHaveBeenCalledTimes(2)

      expect(onBlur).not.toHaveBeenCalled()
    })
  })

  it("calls onFocus when the app is focused", async () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()

    renderHook(() => useAppLifecycle({ onFocus, onBlur }))

    const onStateChange = (global as any).onStateChange

    await act(async () => {
      onStateChange("active")("inactive")

      expect(onBlur).toHaveBeenCalledTimes(1)

      onStateChange("active")("background")

      expect(onBlur).toHaveBeenCalledTimes(2)

      expect(onFocus).not.toHaveBeenCalled()
    })
  })
})
