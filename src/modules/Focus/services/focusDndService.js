// No browser API lets a web page toggle the OS's system-level Do Not
// Disturb / Focus Mode — that's an even harder platform boundary than the
// mobile app hit (see the RN version of this file). What a web app *can*
// do honestly is control its own notification behavior. This module is a
// simple in-memory flag: while a focus session is active, the app's own
// notification handling can check it and suppress sound/interruption from
// its own alerts, so a task reminder firing mid-session doesn't blow up
// your focus with sound — same idiom as the mobile app, no web-specific
// change needed here.
let isFocusActive = false;

export function setFocusSessionActive(active) {
  isFocusActive = active;
}

export function isFocusSessionActive() {
  return isFocusActive;
}
