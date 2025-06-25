import barba from '@barba/core'
import { gsap } from 'gsap'

import { textOff, textOn, quitHome } from '../animations/page-transitions'
import { updateChevrons } from '../components/terminal'
import { initPageContent, updateGameControlsVisibility } from '../main'
import { scrambleText } from '../utils/text'

// Initialize Barba
export function initializeBarba() {
  // Désactiver la restauration automatique du scroll de Chrome
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  // Hook global pour masquer la scrollbar avant toute transition
  barba.hooks.before((data) => {
    // Ne rien faire si on va vers la home
    if (data.next.namespace === 'home') {
      return
    }

    // Ajouter la classe pour masquer la scrollbar
    document.body.classList.add('barba-transition')

    // Animation pour garantir que la scrollbar reste cachée
    document.body.style.animation = 'hide-scrollbars 1.5s forwards'

    // S'assurer que le scroll est bloqué
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  })

  // Hook global pour rétablir la scrollbar après les transitions
  barba.hooks.after(() => {
    // Remettre le scroll en haut
    window.scrollTo(0, 0)

    // Mettre à jour les chevrons pour s'assurer qu'ils sont correctement affichés
    if (typeof updateChevrons === 'function') {
      gsap.delayedCall(0.1, updateChevrons)
    }

    // Mettre à jour la visibilité des contrôles du jeu
    if (typeof updateGameControlsVisibility === 'function') {
      gsap.delayedCall(0.1, updateGameControlsVisibility)
    }

    // Appliquer les styles mobiles si nécessaire
    const isMobile = window.innerWidth < 992
    const viewportRight = document.querySelector('.viewport_right')
    const viewportRightInner = document.querySelector('.viewport_right-inner')
    const contentWrapper = document.querySelector('.content-wrapper')
    const viewContainer = document.querySelector('.view-container')
    const gameInner = document.querySelector('.game_inner')
    const isGameView = document.querySelector('#game-view.is-visible')

    if (isMobile && viewportRight && !isGameView) {
      gsap.set(viewportRight, {
        height: 'auto',
        minHeight: 'auto',
        display: 'block',
        overflow: 'visible',
      })

      if (viewportRightInner) {
        gsap.set(viewportRightInner, {
          height: 'auto',
          minHeight: 'auto',
          display: 'block',
          overflow: 'visible',
        })
      }

      if (contentWrapper) {
        gsap.set(contentWrapper, {
          height: 'auto',
          minHeight: 'auto',
          display: 'block',
          overflow: 'visible',
        })
      }

      if (viewContainer) {
        gsap.set(viewContainer, {
          height: 'auto',
          minHeight: 'auto',
          display: 'block',
          overflow: 'visible',
        })
      }

      if (gameInner) {
        gsap.set(gameInner, {
          height: 'auto',
          minHeight: 'auto',
          display: 'block',
          overflow: 'visible',
        })
      }
    }

    // Attendre que les animations soient terminées avant de réactiver la scrollbar
    gsap.delayedCall(0.3, () => {
      // Retirer la classe de masquage de scrollbar
      document.body.classList.remove('barba-transition')

      // Arrêter l'animation
      document.body.style.animation = ''

      // Rétablir le scroll normal
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    })
  })

  // Définir la transition par défaut
  const defaultTransition = {
    name: 'default-transition',
    leave: ({ current }) => {
      return new Promise((resolve) => {
        textOff(current.container)
        gsap.delayedCall(0.4, resolve)
      })
    },
    enter({ next, current }) {
      textOn(next.container)

      // Récupérer le toggle actif de la page précédente
      const activeToggle = current?.container.querySelector(
        '.toggle_button.is-active'
      )
      const label = next.container.querySelector('.is--label')

      if (activeToggle && label) {
        // Positionner le label exactement comme le toggle
        const toggleRect = activeToggle.getBoundingClientRect()
        gsap.set(label, {
          position: 'absolute',
          top: toggleRect.top,
          left: toggleRect.left,
          width: toggleRect.width,
          height: toggleRect.height,
          display: 'flex',
        })

        // Animer le label vers sa position finale
        gsap.to(label, {
          position: 'static',
          clearProps: 'all',
          duration: 0.3,
          ease: 'power2.inOut',
        })

        // Appliquer l'effet de scramble
        textOff(label)
        textOn(label)
      }

      // Récupérer les labels du manifesto
      const nextLabel = next.container.querySelector('#manifesto > .label')
      const currentLabel = current?.container.querySelector(
        '#manifesto > .label'
      )

      // Récupérer les éléments avec la classe is--scramble
      const nextScramble = next.container.querySelector('.is--scramble')
      const currentScramble = current?.container.querySelector('.is--scramble')

      // Appliquer le scramble sur les labels du manifesto
      if (nextLabel && currentLabel) {
        scrambleText(nextLabel, nextLabel.textContent)
      }

      // Appliquer le scramble sur les éléments .is--scramble
      if (nextScramble && currentScramble) {
        scrambleText(nextScramble, nextScramble.textContent)
      }

      return Promise.resolve()
    },
    after() {
      initPageContent()
    },
  }

  // Définir la transition pour quitter la home
  const leaveHomeTransition = {
    name: 'leave-home-transition',
    from: { namespace: 'home' },
    leave: (data) => {
      return new Promise((resolve) => {
        textOff(data.current.container)
        gsap.delayedCall(0.4, () => {
          quitHome().then(resolve)
        })
      })
    },
    enter({ next, current }) {
      textOn(next.container)
      const nextLabel = next.container.querySelector('#manifesto > .label')
      const currentLabel = current?.container.querySelector(
        '#manifesto > .label'
      )
      if (nextLabel && currentLabel) {
        scrambleText(nextLabel, nextLabel.textContent)
      }
      return Promise.resolve()
    },
    after() {
      initPageContent()
    },
  }

  // Initialiser Barba avec des options améliorées
  barba.init({
    prevent: ({ el }) => {
      // Empêcher Barba de gérer les liens vers la home
      const href = el.href.replace(window.location.origin, '')
      return (
        href === '/' ||
        href === '/index.html' ||
        href.startsWith('/?') ||
        href.startsWith('/index.html?')
      )
    },
    debug: false,
    preventRunning: true,
    prefetch: true,
    transitions: [leaveHomeTransition, defaultTransition],
  })

  // Hooks globaux pour améliorer la gestion des erreurs et le debugging
  barba.hooks.enter((data) => {
    // Ne rien faire si on va vers la home
    if (data.next.namespace === 'home') {
      return
    }

    // S'assurer que les conteneurs sont toujours visibles après un certain délai
    gsap.delayedCall(1, () => {
      if (data.next.container.style.opacity === '0') {
        gsap.to(data.next.container, { opacity: 1, duration: 0.3 })
      }
    })
  })

  // Remplacer le hook error par un gestionnaire d'erreurs global
  window.addEventListener('error', (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes('barba')
    ) {
      // En cas d'erreur, s'assurer que la page est visible
      document.body.classList.remove('barba-transition')
      document.body.style.animation = ''
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''

      const currentContainer = document.querySelector(
        '[data-barba="container"]'
      )
      if (currentContainer) {
        currentContainer.style.opacity = '1'
      }
    }
  })

  // Améliorer la détection de la navigation browser
  window.addEventListener('popstate', () => {
    // Ne rien faire si on va vers la home
    const currentPath = window.location.pathname
    if (currentPath === '/' || currentPath === '/index.html') {
      window.location.reload()
      return
    }

    // Explicitement indiquer à Barba que c'est une navigation browser
    if (barba.history && barba.history.current) {
      barba.history.current.trigger = 'back'
    }
  })
}
