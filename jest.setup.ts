import { chrome } from "jest-chrome"

// @ts-expect-error we need to set this to use browser polyfill
chrome.runtime.id = "test id"
Object.assign(global, { chrome })

// We need to import this after we setup jest chrome
import browser from "webextension-polyfill"
Object.assign(global, { browser })
