/**
 * Trigger soft native haptic vibration feedback for mobile devices & PWAs.
 * @param {number|number[]} pattern - Duration in ms (default 15ms soft click)
 */
export function triggerHaptic(pattern = 15) {
  try {
    // Check setting from local storage - return immediately if disabled
    const rawSettings = localStorage.getItem('attendx_settings')
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings)
      if (parsed.hapticFeedback === false || parsed.hapticsEnabled === false) {
        return
      }
    }
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern)
    }
  } catch (e) {
    // Ignore if unsupported or blocked by browser policy
  }
}
