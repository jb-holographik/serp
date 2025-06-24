import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

// import { initScanAnimation } from './animations/scan.js'
import { startLoaderAnimation } from './components/loader.js'
import { initGame } from './components/snake'
import {
  initializeTerminal,
  ensureTerminalChevrons,
  updateWelcomeText,
  initCommands,
  updateChevrons,
} from './components/terminal.js'
import { initializeBarba } from './config/barba.js'
import { scrambleText } from './utils/text.js'

gsap.registerPlugin(CustomEase)

CustomEase.create('serpeasing', 'M0,0 C0.37,0.01 0.01,0.99 1,1')

// Afficher l'ASCII art dans la console
function displayAsciiArt() {
  // Utiliser une approche plus simple pour l'affichage unique
  // Vérifier si l'ASCII art a déjà été affiché
  if (window.asciiArtTimestamp) {
    // Ne pas afficher si moins de 100ms se sont écoulées depuis le dernier affichage
    // Cela évite les doubles affichages causés par des réinitialisations rapides ou Barba.js
    const now = Date.now()
    if (now - window.asciiArtTimestamp < 100) return
  }

  const asciiArt = `
  ██████╗███████╗██████╗ ██████╗ corp
 ██╔════╝██╔════╝██╔══██╗██╔══██╗
 ╚█████╗ █████╗  ██████╔╝██████╔╝
  ╚═══██╗██╔══╝  ██╔══██╗██╔═══╝ 
 ██████╔╝███████╗██║  ██║██║     
 ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     `

  console.log('%c' + asciiArt, 'color: #ff4139; font-weight: bold;')
  console.log(
    '%cSERP Corp',
    'color: #ff4139; font-size: 16px; font-weight: bold;'
  )

  // Enregistrer le timestamp de cet affichage
  window.asciiArtTimestamp = Date.now()
}

// Data update functions
const dataConfig = {
  '.is-rate': {
    type: 'number',
    min: 40,
    max: 50,
    suffix: '%',
  },
  '.is-souls': {
    type: 'number',
    min: 91,
    max: 97,
    range: true,
    decimalPlaces: 3,
    suffix: '',
  },
  '.is-entropy': {
    type: 'number',
    range: true,
    min: -0.017,
    max: +0.115,
    suffix: 'Δ',
    decimalPlaces: 3,
  },
  '.is-trust': {
    type: 'text',
    options: ['███%', '███%', '██%', '--'],
  },
  '.is-initiation': {
    type: 'number',
    min: 5,
    max: 12,
    suffix: 'await.',
  },
  '.is-neural': {
    type: 'text',
    options: ['High', 'Med.', 'Null', 'Max.', 'Lost', '--', '∞'],
  },
  '.is-origin': {
    type: 'text',
    options: ['@serp', '@v0id', '--', '@Ω421', '@Ω314'],
  },
  '.is-pulse': {
    type: 'number',
    min: 10.8,
    max: 17.7,
    suffix: 'HZ',
  },
  '.is-memory': {
    type: 'number',
    min: 18,
    max: 71,
    suffix: '% Mem',
  },
  '.is-cpu': {
    type: 'number',
    min: 21,
    max: 82,
    suffix: '% CPU',
  },
}

function getRandomValue(config) {
  if (config.type === 'number') {
    if (config.range) {
      const value = Math.random() * (config.max - config.min) + config.min
      const formattedValue = value.toFixed(config.decimalPlaces || 3)
      const signedValue = value >= 0 ? `+${formattedValue}` : formattedValue
      return `${signedValue}${config.suffix || ''}`
    }

    const value =
      Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
    return `${value}${config.suffix || ''}`
  } else if (config.type === 'text') {
    return config.options[Math.floor(Math.random() * config.options.length)]
  }

  return ''
}

function updateDataWithScramble() {
  Object.entries(dataConfig).forEach(([selector, config]) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      const newValue = getRandomValue(config)
      scrambleText(el, newValue)
    })
  })
}

// One-time initialization
function initializeOnce() {
  // Afficher l'ASCII art dans la console
  displayAsciiArt()

  // Start data update interval
  setInterval(updateDataWithScramble, 4000)

  // Initialize loader
  startLoaderAnimation()
}

// Initialize page content
export function initPageContent() {
  // Initialize terminal
  initializeTerminal()

  // Initialize commands
  initCommands()
  updateWelcomeText()

  // Initialize scan animation
  // initScanAnimation()

  // Initialize dropdown toggle
  const dropdownButton = document.querySelector('.dropdown')
  const dropdownInner = document.querySelector('.dropdown-inner')

  // Remove any existing event listeners
  if (dropdownButton) {
    const newButton = dropdownButton.cloneNode(true)
    dropdownButton.parentNode.replaceChild(newButton, dropdownButton)

    // Re-attach event listener to the new button
    newButton.addEventListener('click', () => {
      if (dropdownInner) {
        const isVisible =
          window.getComputedStyle(dropdownInner).display !== 'none'
        dropdownInner.style.display = isVisible ? 'none' : 'flex'
      }
    })
  }

  // Initialize other features
  initScrambleOnHover('[data-scramble]', { target: '.label' })
  moveHomeDependingOnScreen()
  initToggleView()

  // Gestion du toggle
  const gameToggle = document.getElementById('game')
  const manifestoToggle = document.getElementById('manifesto')

  if (gameToggle && manifestoToggle) {
    // S'assurer que le bon toggle est actif sur la home page
    const namespace = document.querySelector('[data-barba="container"]')
      ?.dataset.barbaNamespace
    if (namespace === 'home') {
      gameToggle.classList.add('is-active')
      manifestoToggle.classList.remove('is-active')
    }

    // Gérer les clics sur les toggles
    gameToggle.addEventListener('click', () => {
      if (!gameToggle.classList.contains('is-active')) {
        gameToggle.classList.add('is-active')
        manifestoToggle.classList.remove('is-active')

        // Vérifier si nous sommes sur la page home avant d'initialiser le jeu
        const namespace = document.querySelector('[data-barba="container"]')
          ?.dataset.barbaNamespace
        if (namespace === 'home') {
          // Initialiser le jeu immédiatement
          requestAnimationFrame(() => {
            initGame()
          })
        }
      }
    })

    manifestoToggle.addEventListener('click', () => {
      if (!manifestoToggle.classList.contains('is-active')) {
        manifestoToggle.classList.add('is-active')
        gameToggle.classList.remove('is-active')
      }
    })
  }
}

// Toggle
function initToggleView() {
  const terminalBtn = document.getElementById('manifesto')
  const snakeBtn = document.getElementById('game')
  const terminalView = document.getElementById('manifesto-view')
  const snakeView = document.getElementById('game-view')
  const leftArrow = document.getElementById('left-arrow')
  const rightArrow = document.getElementById('right-arrow')
  const viewportRight = document.querySelector('.viewport_right')
  const viewportRightInner = document.querySelector('.viewport_right-inner')
  const contentWrapper = document.querySelector('.content-wrapper')
  const viewContainer = document.querySelector('.view-container')
  const gameInner = document.querySelector('.game_inner')
  const gameControls = document.querySelector('.game-controls')

  // Vérifie si tous les éléments nécessaires sont présents
  if (
    !terminalBtn ||
    !snakeBtn ||
    !terminalView ||
    !snakeView ||
    !leftArrow ||
    !rightArrow ||
    !viewportRight ||
    !viewportRightInner ||
    !contentWrapper ||
    !viewContainer ||
    !gameInner ||
    !gameControls
  ) {
    return
  }

  function toggleView(showTerminal) {
    // Vérifier si nous sommes sur la page d'accueil
    const namespace = document.querySelector('[data-barba="container"]')
      ?.dataset.barbaNamespace
    const isHome = namespace === 'home'
    const isMobile = window.innerWidth < 992

    terminalView.classList.toggle('is-visible', showTerminal)
    snakeView.classList.toggle('is-visible', !showTerminal)

    terminalBtn.classList.toggle('is-active', showTerminal)
    snakeBtn.classList.toggle('is-active', !showTerminal)

    leftArrow.classList.toggle('is-active', showTerminal)
    rightArrow.classList.toggle('is-active', !showTerminal)

    leftArrow.style.opacity = showTerminal ? '1' : '0.5'
    rightArrow.style.opacity = showTerminal ? '0.5' : '1'

    // Mettre à jour la visibilité des contrôles et du bouton restart
    updateGameControlsVisibility()

    // Ajuster les styles pour le mode jeu
    if (showTerminal) {
      // Mode manifesto
      if (isMobile) {
        // Sur mobile, height: auto pour le manifesto
        viewportRight.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
        `
        viewportRightInner.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
        `
        contentWrapper.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
        `
        viewContainer.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
        `
        gameInner.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
        `
      } else {
        // Sur desktop, retour aux valeurs CSS par défaut
        viewportRight.style.cssText = ''
        viewportRightInner.style.cssText = ''
        contentWrapper.style.cssText = ''
        viewContainer.style.cssText = ''
        gameInner.style.cssText = ''
      }

      // Mettre à jour les chevrons quand on revient au manifesto
      setTimeout(() => {
        ensureTerminalChevrons()
      }, 0)
    } else {
      // Mode jeu - même configuration pour mobile et desktop
      viewportRight.style.cssText = `
        height: 100vh;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `
      viewportRightInner.style.cssText = `
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `
      contentWrapper.style.cssText = `
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `
      viewContainer.style.cssText = `
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `
      gameInner.style.cssText = `
        flex: 1;
        min-height: 0;
        display: flex;
        position: relative;
        overflow: hidden;
      `

      // Initialiser le jeu seulement si on est sur la home
      if (isHome) {
        // Nettoyer l'ancien jeu si nécessaire
        if (gameInner._cleanup) {
          gameInner._cleanup()
        }
        // Initialiser le nouveau jeu
        initGame()
      }
    }
  }

  terminalBtn.addEventListener('click', () => {
    toggleView(true)
  })

  snakeBtn.addEventListener('click', () => {
    toggleView(false)
  })

  function addHoverArrowEffect(btn, arrow) {
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('is-active')) {
        arrow.style.opacity = '1'
        arrow.classList.remove('animate')
        void arrow.offsetWidth
        arrow.classList.add('animate')
      }
    })

    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('is-active')) {
        arrow.style.opacity = '0.5'
      }
    })

    arrow.addEventListener('animationend', () => {
      arrow.classList.remove('animate')
    })
  }

  addHoverArrowEffect(terminalBtn, leftArrow)
  addHoverArrowEffect(snakeBtn, rightArrow)

  // S'assurer que les styles sont corrects au chargement initial
  if (snakeView.classList.contains('is-visible')) {
    viewportRight.style.cssText = `
      height: 100vh;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `
    viewportRightInner.style.cssText = `
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `
    contentWrapper.style.cssText = `
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `
    viewContainer.style.cssText = `
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `
    gameInner.style.cssText = `
      flex: 1;
      min-height: 0;
      display: flex;
      position: relative;
      overflow: hidden;
    `
  } else {
    // S'assurer que les chevrons sont présents au chargement initial du manifesto
    setTimeout(() => {
      ensureTerminalChevrons()
    }, 0)
  }
}

// Scramble text
function initScrambleOnHover(selector, options = {}) {
  const {
    speed = 150,
    target = null, // Permet de définir une sous-cible, ex: '.label'
  } = options

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?/[]{}'

  document.querySelectorAll(selector).forEach((el) => {
    const targetEl = target ? el.querySelector(target) : el
    if (!targetEl) return

    const finalText = targetEl.textContent

    el.addEventListener('mouseenter', () => {
      let output = ''
      let revealed = 0

      const scrambleInterval = setInterval(() => {
        output = ''

        for (let i = 0; i < finalText.length; i++) {
          if (i < revealed) {
            output += finalText[i]
          } else {
            output += chars.charAt(Math.floor(Math.random() * chars.length))
          }
        }

        targetEl.textContent = output

        if (revealed < finalText.length) {
          revealed++
        } else {
          clearInterval(scrambleInterval)
          targetEl.textContent = finalText
        }
      }, speed)
    })
  })
}

function moveHomeDependingOnScreen() {
  const home = document.querySelector('.home')
  const navWrapper = document.querySelector('.nav-wrapper')
  const header = document.querySelector('.header')

  if (!home || !navWrapper || !header) return

  const mobileMediaQuery = window.matchMedia('(max-width: 991px)')

  function handleScreenChange(e) {
    if (e.matches) {
      // On est en mobile
      if (home.parentElement !== navWrapper) {
        navWrapper.insertBefore(home, navWrapper.firstChild)
      }
    } else {
      // On est en desktop
      if (home.parentElement !== header) {
        header.insertBefore(home, navWrapper)
      }
    }
  }

  // On initialise au chargement
  handleScreenChange(mobileMediaQuery)

  // On écoute les changements de taille d'écran
  mobileMediaQuery.addEventListener('change', handleScreenChange)
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initializeOnce()
  initializeBarba()
  initPageContent()

  // S'assurer que les contrôles du jeu sont dans le bon état
  updateGameControlsVisibility()

  // Appliquer les styles mobiles si nécessaire
  const isMobile = window.innerWidth < 992
  const viewportRight = document.querySelector('.viewport_right')
  const viewportRightInner = document.querySelector('.viewport_right-inner')
  const contentWrapper = document.querySelector('.content-wrapper')
  const viewContainer = document.querySelector('.view-container')
  const gameInner = document.querySelector('.game_inner')
  const isGameView = document.querySelector('#game-view.is-visible')

  if (isMobile && viewportRight && !isGameView) {
    viewportRight.style.height = 'auto'
    viewportRight.style.minHeight = 'auto'
    viewportRight.style.display = 'block'
    viewportRight.style.overflow = 'visible'

    if (viewportRightInner) {
      viewportRightInner.style.height = 'auto'
      viewportRightInner.style.minHeight = 'auto'
      viewportRightInner.style.display = 'block'
      viewportRightInner.style.overflow = 'visible'
    }

    if (contentWrapper) {
      contentWrapper.style.height = 'auto'
      contentWrapper.style.minHeight = 'auto'
      contentWrapper.style.display = 'block'
      contentWrapper.style.overflow = 'visible'
    }

    if (viewContainer) {
      viewContainer.style.height = 'auto'
      viewContainer.style.minHeight = 'auto'
      viewContainer.style.display = 'block'
      viewContainer.style.overflow = 'visible'
    }

    if (gameInner) {
      gameInner.style.height = 'auto'
      gameInner.style.minHeight = 'auto'
      gameInner.style.display = 'block'
      gameInner.style.overflow = 'visible'
    }
  }

  // Initialize game only if we're on the home page
  const namespace = document.querySelector('[data-barba="container"]')?.dataset
    .barbaNamespace
  if (namespace === 'home') {
    // S'assurer que le toggle du jeu est actif
    const gameToggle = document.getElementById('game')
    const manifestoToggle = document.getElementById('manifesto')
    if (gameToggle && manifestoToggle) {
      gameToggle.classList.add('is-active')
      manifestoToggle.classList.remove('is-active')
    }
    initGame()
  }
})

// Resize handler
window.addEventListener('resize', () => {
  const namespace = document.querySelector('[data-barba="container"]')?.dataset
    .barbaNamespace
  const isMobile = window.innerWidth < 992
  const viewportRight = document.querySelector('.viewport_right')
  const viewportRightInner = document.querySelector('.viewport_right-inner')
  const contentWrapper = document.querySelector('.content-wrapper')
  const viewContainer = document.querySelector('.view-container')
  const gameInner = document.querySelector('.game_inner')
  const isGameView = document.querySelector('#game-view.is-visible')

  // Appeler la fonction dédiée pour gérer les contrôles
  updateGameControlsVisibility()

  if (viewportRight) {
    if (namespace === 'home') {
      // Comportement spécifique à la page d'accueil
      if (!isMobile) {
        viewportRight.style.width = window.innerWidth >= 1440 ? '60vw' : '70vw'

        if (isGameView) {
          viewportRight.style.cssText = `
            width: ${window.innerWidth >= 1440 ? '60vw' : '70vw'};
            height: 100vh;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          `
          if (viewportRightInner) {
            viewportRightInner.style.cssText = `
              height: 100%;
              min-height: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            `
          }
          if (contentWrapper) {
            contentWrapper.style.cssText = `
              height: 100%;
              min-height: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            `
          }
          if (viewContainer) {
            viewContainer.style.cssText = `
              flex: 1;
              min-height: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            `
          }
          if (gameInner) {
            gameInner.style.cssText = `
              flex: 1;
              min-height: 0;
              display: flex;
              position: relative;
              overflow: hidden;
            `
          }
        } else {
          // Mode manifesto en desktop sur la home
          viewportRight.style.width =
            window.innerWidth >= 1440 ? '60vw' : '70vw'
          viewportRight.style.height = ''
          viewportRight.style.minHeight = ''
          viewportRight.style.display = ''
          viewportRight.style.overflow = ''

          if (viewportRightInner) viewportRightInner.style = ''
          if (contentWrapper) contentWrapper.style = ''
          if (viewContainer) viewContainer.style = ''
          if (gameInner) gameInner.style = ''
        }
      } else {
        // Mobile home
        viewportRight.style.removeProperty('width')
      }
    } else {
      // Comportement pour les pages doctrine et recruitment
      if (!isMobile) {
        // En desktop, on restaure le layout original de ces pages
        viewportRight.style = ''
        if (viewportRightInner) viewportRightInner.style = ''
        if (contentWrapper) contentWrapper.style = ''
        if (viewContainer) viewContainer.style = ''
        if (gameInner) gameInner.style = ''
      } else {
        // En mobile, styles spécifiques pour doctrine et recruitment
        viewportRight.style.cssText = `
          height: auto;
          min-height: auto;
          display: block;
          overflow: visible;
          width: 100%;
        `
        if (viewportRightInner) {
          viewportRightInner.style.cssText = `
            height: auto;
            min-height: auto;
            display: block;
            overflow: visible;
          `
        }
        if (contentWrapper) {
          contentWrapper.style.cssText = `
            height: auto;
            min-height: auto;
            display: block;
            overflow: visible;
          `
        }
        if (viewContainer) {
          viewContainer.style.cssText = `
            height: auto;
            min-height: auto;
            display: block;
            overflow: visible;
          `
        }
      }
    }
  }

  // Mise à jour des chevrons pour toutes les pages lors du redimensionnement
  if (typeof updateChevrons === 'function') {
    updateChevrons()
  }
})

// Fonction de gestion des contrôles
export function updateGameControlsVisibility() {
  const isMobile = window.innerWidth < 992
  const isGameView = document.querySelector('#game-view.is-visible')
  const gameControls = document.querySelector('.game-controls')
  const restartBtn = document.getElementById('restart')

  // Ne rien faire si les éléments n'existent pas
  if (!gameControls || !restartBtn) return

  // Si on n'est pas en mode jeu, cacher les contrôles
  if (!isGameView) {
    gameControls.style.visibility = 'hidden'
    restartBtn.style.display = 'none'
    return
  }

  // Si c'est le mode jeu
  if (isMobile) {
    // Sur mobile/tablette
    gameControls.style.visibility = 'visible'
    restartBtn.style.display = 'none'
  } else {
    // Sur desktop
    gameControls.style.visibility = 'hidden'
    restartBtn.style.display = 'flex'
  }
}

window.addEventListener('error', function (event) {
  if (
    event.message &&
    event.message.includes('ControlLooksLikePasswordCredentialField')
  ) {
    // Supprime l'erreur iCloud Passwords de la console
    event.stopImmediatePropagation()
    event.preventDefault()
    return false
  }
})
