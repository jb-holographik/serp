import { gsap } from 'gsap'

import { startLoaderAnimation } from '../components/loader'

// Animation constants
export const commonEasing = 'serpeasing'
export const commonDuration = 1

// Animation functions
export function textOff(container) {
  const manifestoText = container.querySelector('.is-manifesto-text')
  const chevrons = container.querySelector('.chevrons')
  if (manifestoText) {
    gsap.to(manifestoText, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    })
  }
  if (chevrons) {
    gsap.to(chevrons, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    })
  }
}

export function textOn(container) {
  const manifestoText = container.querySelector('.is-manifesto-text')
  const chevrons = container.querySelector('.chevrons')

  const blinkTl = gsap.timeline()

  if (manifestoText) {
    blinkTl
      .set(manifestoText, { opacity: 0 })
      .to(manifestoText, {
        opacity: 1,
        duration: 0.2,
        ease: 'none',
      })
      .to(manifestoText, {
        opacity: 0,
        duration: 0.2,
        ease: 'none',
      })
      .to(manifestoText, {
        opacity: 1,
        duration: 0.2,
        ease: 'none',
      })
  }

  if (chevrons) {
    blinkTl
      .set(chevrons, { opacity: 0 }, 0)
      .to(
        chevrons,
        {
          opacity: 1,
          duration: 0.2,
          ease: 'none',
        },
        0
      )
      .to(
        chevrons,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'none',
        },
        '>'
      )
      .to(
        chevrons,
        {
          opacity: 1,
          duration: 0.2,
          ease: 'none',
        },
        '>'
      )
  }
}

export function quitHome() {
  const viewportRight = document.querySelector('.viewport_right')
  const viewportLeft = document.querySelector('.viewport_left')
  const toggleButtons = document.querySelectorAll(
    '.toggle_button:not(.is-active)'
  )
  const activeButton = document.querySelector('.toggle_button.is-active')
  const arrows = document.querySelectorAll('.toggle_arrow')
  const destinationLabel = document.querySelector('.is--label')

  // Sur mobile/tablette, juste cacher viewportLeft sans animation
  if (window.innerWidth < 992) {
    viewportLeft.style.display = 'none'
    return Promise.resolve()
  }

  // Timeline pour synchroniser les animations
  const tl = gsap.timeline()

  // S'assurer que le label de destination est masqué initialement
  if (destinationLabel) {
    gsap.set(destinationLabel, { display: 'none' })
  }

  // Animer les boutons de toggle inactifs et les flèches
  tl.to(toggleButtons, {
    flex: '0 1 0%',
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
  })
    .to(
      arrows,
      {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          toggleButtons.forEach((btn) => (btn.style.display = 'none'))
          arrows.forEach((arrow) => (arrow.style.display = 'none'))
        },
      },
      '<'
    )
    // Animer le bouton actif
    .to(
      activeButton,
      {
        flex: '1 1 100%',
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '<'
    )

  // Animer viewport_right
  tl.to(
    viewportRight,
    {
      width: '100vw',
      duration: 1,
      ease: 'serpeasing',
      onComplete: function () {
        viewportLeft.style.display = 'none'
        if (activeButton) {
          activeButton.style.display = 'none'
          activeButton.classList.remove('is-active')
        }
      },
    },
    0
  )

  return tl
}

export function enterHome() {
  const timeline = gsap.timeline()

  // Lancer le loader
  const loaderTimeline = startLoaderAnimation()
  if (loaderTimeline) {
    timeline.add(loaderTimeline)
  }

  return timeline
}
