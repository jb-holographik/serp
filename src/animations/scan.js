import { gsap } from 'gsap'
let scanTimeline = null
export function initScanAnimation() {
  const scan = document.querySelector('.scan')
  if (!scan) return
  if (scanTimeline) {
    scanTimeline.kill()
  }
  scanTimeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 42,
    delay: 4,
  })
  scanTimeline.fromTo(
    scan,
    {
      top: '0%',
    },
    {
      top: '100%',
      duration: 4,
      ease: 'none',
    }
  )
  return scanTimeline
}
export function killScanAnimation() {
  if (scanTimeline) {
    scanTimeline.kill()
    scanTimeline = null
  }
}
