import onStateChange from "../src/onStateChange"

describe("onStateChange", () => {
  it("calls onFocus when the app is focused (and saves the previous state)", async () => {
    const setPreviousAppState = jest.fn()
    const onFocus = jest.fn()
    const onBlur = jest.fn()

    onStateChange("inactive", setPreviousAppState, onFocus, onBlur)("active")

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(setPreviousAppState).toHaveBeenNthCalledWith(1, "active")

    onStateChange("background", setPreviousAppState, onFocus, onBlur)("active")

    expect(onFocus).toHaveBeenCalledTimes(2)
    expect(setPreviousAppState).toHaveBeenNthCalledWith(2, "active")

    expect(onBlur).not.toHaveBeenCalled()
  })

  it("calls onBlur when the app is blurred (and saves the previous state)", async () => {
    const setPreviousAppState = jest.fn()
    const onFocus = jest.fn()
    const onBlur = jest.fn()

    onStateChange("active", setPreviousAppState, onFocus, onBlur)("background")

    expect(onBlur).toHaveBeenCalledTimes(1)
    expect(setPreviousAppState).toHaveBeenNthCalledWith(1, "background")

    onStateChange("active", setPreviousAppState, onFocus, onBlur)("inactive")

    expect(onBlur).toHaveBeenCalledTimes(2)
    expect(setPreviousAppState).toHaveBeenNthCalledWith(2, "inactive")

    expect(onFocus).not.toHaveBeenCalled()
  })
})
