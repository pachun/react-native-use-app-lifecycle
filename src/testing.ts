import { AppState, AppStateStatus } from "react-native"
import { act } from "@testing-library/react-native"
import { onFocusDebounceMilliseconds } from "./index"

type AppStateChangeHandler = (state: AppStateStatus) => void

const fakeTimersAreInstalled = () =>
  jest.isMockFunction(globalThis.setTimeout) ||
  Object.prototype.hasOwnProperty.call(globalThis.setTimeout, "clock")

const settleTheFocusDebounce = () => {
  if (fakeTimersAreInstalled()) {
    jest.advanceTimersByTime(onFocusDebounceMilliseconds)
  }
}

const launchTheApp = (renderTheApp: () => void) => {
  const subscribers: { handlers: AppStateChangeHandler[] } = { handlers: [] }

  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_event, handler) => {
      const changeHandler = handler as AppStateChangeHandler
      subscribers.handlers = [...subscribers.handlers, changeHandler]
      return {
        remove: () => {
          subscribers.handlers = subscribers.handlers.filter(
            existing => existing !== changeHandler,
          )
        },
      }
    })

  const changeAppStateTo = (state: AppStateStatus) => {
    AppState.currentState = state
    subscribers.handlers.forEach(handler => handler(state))
  }

  AppState.currentState = "active"
  renderTheApp()

  const backgroundTheApp = () => act(() => changeAppStateTo("background"))

  const foregroundTheApp = () =>
    act(() => {
      changeAppStateTo("active")
      settleTheFocusDebounce()
    })

  return { backgroundTheApp, foregroundTheApp }
}

export default launchTheApp
