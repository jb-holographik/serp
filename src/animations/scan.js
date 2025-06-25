import { gsap } from 'gsap'

let scanTimeline = null

export function initScanAnimation() {
  const scan = document.querySelector('.scan')
  if (!scan) return

  // Nettoyer l'ancienne animation si elle existe
  if (scanTimeline) {
    scanTimeline.kill()
  }

  // Créer une timeline pour l'animation
  scanTimeline = gsap.timeline({
    repeat: -1, // Répéter indéfiniment
    repeatDelay: 42, // Attendre 10s entre chaque animation (14s total avec les 4s d'animation)
    delay: 4, // Démarrer 4 secondes après l'arrivée sur la page
  })

  // Animation de scan
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
