import barba from '@barba/core'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

CustomEase.create('serpeasing', 'M0,0 C0.37,0.01 0.01,0.99 1,1')

// Animation constants
const commonEasing = 'serpeasing'
const commonDuration = 1

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

// Terminal commands and username
let storedUsername = generateDefaultUsername()
const commands = {}

function generateDefaultUsername() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000)
  return `anon${randomDigits}`
}

function updateWelcomeText() {
  const welcomeElement = document.querySelector('.welcome')
  if (welcomeElement) {
    welcomeElement.textContent = `Welcome, ${storedUsername} !`
  }
}

// Initialize commands from DOM
function initCommands() {
  const commandElements = document.querySelectorAll('.commands_item')
  commandElements.forEach((el) => {
    const name = el.getAttribute('data-command')
    const response = el.getAttribute('data-response')
    if (name && response) {
      commands[name.toLowerCase()] = response
    }
  })
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

function scrambleText(element, finalText, duration = 500) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%.-'
  let iterations = 0
  const length = Math.max(finalText.length, element.textContent.length)

  const interval = setInterval(() => {
    const scrambled = finalText
      .split('')
      .map((char, i) => {
        if (i < iterations) return finalText[i]
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join('')
    element.textContent = scrambled
    iterations++
    if (iterations >= length) {
      clearInterval(interval)
      element.textContent = finalText
    }
  }, duration / length)
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

// Loader animation
function startLoaderAnimation() {
  const loader = document.querySelector('.loader')
  const loaderWrap = document.querySelector('.loader-wrap')
  const scan = document.querySelector('.scan.is-loader-1')
  const progressAmount = document.querySelector('.progress-amount')
  const loaderLogs = document.querySelectorAll('.loader_log')
  const loaderSections = ['.loader_logos', '.loader_logs', '.loader_progress']
  const logos = ['.logo-2', '.logo-3', '.logo-4', '.logo-5', '.logo-6']

  if (!loader) return

  const totalDuration = 1.5
  const durationPerLogo = totalDuration / logos.length
  const durationPerLog = totalDuration / loaderLogs.length

  const timeline = gsap.timeline()

  timeline.set(
    loader,
    {
      display: 'flex',
      height: '120svh',
    },
    0
  )

  timeline.set(
    loaderSections,
    {
      display: 'block',
      opacity: 1,
    },
    0
  )

  logos.forEach((selector, index) => {
    timeline.set(selector, { display: 'block' }, index * durationPerLogo)
  })

  loaderLogs.forEach((log, index) => {
    timeline.set(log, { display: 'block' }, index * durationPerLog)
  })

  timeline.to(
    progressAmount,
    {
      innerText: 100,
      duration: totalDuration,
      roundProps: 'innerText',
      onUpdate: function () {
        const progress = this.targets()[0].innerText
        this.targets()[0].innerText = `[ ${progress}% ]`
      },
      ease: 'none',
    },
    0
  )

  if (scan) {
    gsap.to(scan, {
      y: '120svh',
      duration: 2.2,
      ease: 'serpeasing',
    })
  }

  timeline.to(loaderWrap, {
    height: 0,
    duration: 1.8,
    ease: 'serpeasing',
    onComplete: () => {
      document.body.style.overflow = ''
      if (loader) loader.remove()
    },
  })
}

// Game initialization
function initGame() {
  const gameContainer = document.querySelector('.game_inner')
  const lostScreen = document.querySelector('.game_lost')
  const restartBtn = document.getElementById('restart')

  // Config
  const gridSize = 20
  const totalCells = gridSize * gridSize
  const cells = []

  let snake, direction, food, interval

  // Grille
  const grid = document.createElement('div')
  grid.className = 'game-grid'
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    grid.appendChild(cell)
    cells.push(cell)
  }
  gameContainer.appendChild(grid)

  function draw() {
    cells.forEach((cell) => {
      cell.className = 'cell'
      cell.innerHTML = ''
    })

    snake.forEach((i) => cells[i].classList.add('snake'))

    if (food !== null) {
      const foodCell = cells[food]
      foodCell.classList.add('food')
      foodCell.innerHTML = '$'
    }
  }

  function placeFood() {
    let newFood
    do {
      newFood = Math.floor(Math.random() * totalCells)
    } while (snake.includes(newFood))
    food = newFood
  }

  function endGame() {
    clearInterval(interval)
    lostScreen.style.display = 'flex'
  }

  function move() {
    let head = snake[0]
    let next

    if (direction === 1 && head % gridSize === gridSize - 1) {
      next = head - (gridSize - 1)
    } else if (direction === -1 && head % gridSize === 0) {
      next = head + (gridSize - 1)
    } else if (direction === -gridSize && head < gridSize) {
      next = head + gridSize * (gridSize - 1)
    } else if (direction === gridSize && head >= totalCells - gridSize) {
      next = head - gridSize * (gridSize - 1)
    } else {
      next = head + direction
    }

    if (snake.includes(next)) {
      endGame()
      return
    }

    snake.unshift(next)

    if (next === food) {
      placeFood()
    } else {
      snake.pop()
    }

    draw()
  }

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== gridSize) direction = -gridSize
        break
      case 'ArrowDown':
        if (direction !== -gridSize) direction = gridSize
        break
      case 'ArrowLeft':
        if (direction !== 1) direction = -1
        break
      case 'ArrowRight':
        if (direction !== -1) direction = 1
        break
    }
  })

  function startGame() {
    snake = [42, 41, 40]
    direction = 1
    placeFood()
    draw()
    lostScreen.style.display = 'none'
    clearInterval(interval)
    interval = setInterval(move, 150)
  }

  restartBtn.addEventListener('click', () => {
    startGame()
  })

  startGame()
}

// Animation functions
function textOff(container) {
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

function textOn(container) {
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

function quitHome() {
  const viewportRight = document.querySelector('.viewport_right')
  const viewportLeft = document.querySelector('.viewport_left')
  const toggleButtons = document.querySelectorAll(
    '.toggle_button:not(.is-active)'
  )
  const activeButton = document.querySelector('.toggle_button.is-active')
  const arrows = document.querySelectorAll('.toggle_arrow')

  // Sur mobile/tablette, juste cacher viewportLeft sans animation
  if (window.innerWidth < 992) {
    viewportLeft.style.display = 'none'
    return Promise.resolve()
  }

  // Timeline pour synchroniser les animations
  const tl = gsap.timeline()

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
      duration: commonDuration,
      ease: commonEasing,
      onComplete: function () {
        viewportLeft.style.display = 'none'
      },
    },
    0
  )

  return tl
}

function enterHome() {
  const viewportRight = document.querySelector('.viewport_right')
  const viewportLeft = document.querySelector('.viewport_left')
  const toggleButtons = document.querySelectorAll('.toggle_button')
  const arrows = document.querySelectorAll('.toggle_arrow')

  viewportLeft.style.display = 'flex'

  // Sur mobile/tablette, ne rien faire
  if (window.innerWidth < 992) {
    return Promise.resolve()
  }

  // Timeline pour synchroniser les animations
  const tl = gsap.timeline()

  // Restaurer l'affichage des boutons et des flèches
  toggleButtons.forEach((btn) => {
    btn.style.display = ''
    btn.style.flex = ''
  })
  arrows.forEach((arrow) => {
    arrow.style.display = ''
    arrow.style.opacity = ''
  })

  // Animer les boutons de toggle
  tl.to(toggleButtons, {
    flex: '1 1 50%',
    opacity: 1,
    duration: 0.6,
    ease: 'power2.inOut',
  }).to(
    arrows,
    {
      opacity: 1,
      duration: 0.3,
    },
    '<'
  )

  // S'assurer que la largeur initiale est bien définie
  tl.set(viewportRight, { width: '100vw' }, 0).to(
    viewportRight,
    {
      width: window.innerWidth >= 1440 ? '60vw' : '70vw',
      duration: commonDuration,
      ease: commonEasing,
    },
    0
  )

  return tl
}

// One-time initialization
function initializeOnce() {
  // Start data update interval
  setInterval(updateDataWithScramble, 4000)

  // Initialize game
  const gameContainer = document.querySelector('.game_inner')
  if (gameContainer) {
    initGame()
  }

  // Initialize loader
  startLoaderAnimation()
}

// Initialize page content
function initPageContent() {
  // Initialize commands
  initCommands()
  updateWelcomeText()

  // Get DOM elements
  const input = document.querySelector('.input')
  const terminal = document.querySelector('.terminal_inner')
  const sendButton = document.querySelector('.button')

  // Initialize terminal commands if elements exist
  if (input && terminal && sendButton) {
    // Handle keyboard input
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const command = input.value.trim().toLowerCase()
        if (command) {
          processCommand(command, terminal)
          input.value = ''
        }
      }
    })

    // Handle button click
    sendButton.addEventListener('click', function () {
      const command = input.value.trim().toLowerCase()
      if (command) {
        processCommand(command, terminal)
        input.value = ''
      }
    })
  }

  // Initialize other features
  ensureTerminalChevrons()
  initScrambleOnHover('[data-scramble]', { target: '.label' })
  moveHomeDependingOnScreen()
  initToggleView()
}

// Process terminal commands
function processCommand(command, terminal) {
  const typed = document.createElement('span')
  typed.classList.add('is-answer')
  typed.innerHTML = `&gt; ${command}`
  terminal.appendChild(typed)

  // Détection et stockage du nom personnalisé
  if (command.toLowerCase().startsWith('user ')) {
    const name = command.slice(5).trim()
    if (name) {
      storedUsername = name
      const output = document.createElement('span')
      output.classList.add('is-answer')
      output.innerHTML = `&gt; Welcome, ${storedUsername} !`
      terminal.appendChild(output)
      terminal.scrollTop = terminal.scrollHeight
      ensureTerminalChevrons()
    } else {
      const output = document.createElement('span')
      output.classList.add('is-answer')
      output.innerHTML = `&gt; Veuillez entrer un nom après "user"`
      terminal.appendChild(output)
      terminal.scrollTop = terminal.scrollHeight
      ensureTerminalChevrons()
    }
    return
  }

  // Traitement des commandes standards avec injection de username
  const responseText = commands[command]

  if (responseText) {
    const lines = responseText.split('\n')
    let completedLines = 0

    lines.forEach((line, index) => {
      setTimeout(() => {
        const outputLine = document.createElement('span')
        outputLine.classList.add('is-answer')

        // Remplacement de [username] dans chaque ligne
        const replacedLine = line.replace(/\[name\]/gi, storedUsername)

        outputLine.innerHTML = `&gt; ${replacedLine}`
        terminal.appendChild(outputLine)
        terminal.scrollTop = terminal.scrollHeight

        completedLines++
        if (completedLines === lines.length) {
          ensureTerminalChevrons()
        }
      }, index * 100)
    })
  } else {
    setTimeout(() => {
      const output = document.createElement('span')
      output.classList.add('is-answer')
      output.innerHTML = `&gt; Command not found: "${command}"`
      terminal.appendChild(output)
      terminal.scrollTop = terminal.scrollHeight
      ensureTerminalChevrons()
    }, 100)
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
    !gameInner
  ) {
    return
  }

  function toggleView(showTerminal) {
    terminalView.classList.toggle('is-visible', showTerminal)
    snakeView.classList.toggle('is-visible', !showTerminal)

    terminalBtn.classList.toggle('is-active', showTerminal)
    snakeBtn.classList.toggle('is-active', !showTerminal)

    leftArrow.classList.toggle('is-active', showTerminal)
    rightArrow.classList.toggle('is-active', !showTerminal)

    leftArrow.style.opacity = showTerminal ? '1' : '0.5'
    rightArrow.style.opacity = showTerminal ? '0.5' : '1'

    // Ajuster les styles pour le mode jeu
    if (showTerminal) {
      // Retour aux valeurs CSS par défaut
      viewportRight.style.cssText = ''
      viewportRightInner.style.cssText = ''
      contentWrapper.style.cssText = ''
      viewContainer.style.cssText = ''
      gameInner.style.cssText = ''

      // Mettre à jour les chevrons quand on revient au manifesto
      setTimeout(() => {
        ensureTerminalChevrons()
      }, 0)
    } else {
      // Configuration pour le jeu avec une gestion stricte des hauteurs
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

// Initialize Barba
barba.init({
  preventRunning: true,
  transitions: [
    {
      name: 'default-transition',
      before: () => {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
      },
      beforeLeave: ({ current }) => {
        return new Promise((resolve) => {
          textOff(current.container)
          // Attendre que le fade out soit terminé
          gsap.delayedCall(0.4, resolve)
        })
      },
      leave: (data) => {
        if (data.current.namespace === 'home') {
          return quitHome()
        }
        return Promise.resolve()
      },
      beforeEnter: () => {
        // S'assurer que le texte est invisible au début
        const manifestoText = document.querySelector('.is-manifesto-text')
        const chevrons = document.querySelector('.chevrons')

        if (manifestoText) {
          manifestoText.style.opacity = '0'
        }
        if (chevrons) {
          chevrons.style.opacity = '0'
        }
      },
      enter: async ({ next, current }) => {
        if (next.namespace === 'home') {
          const tl = enterHome()
          return new Promise((resolve) => {
            tl.eventCallback('onComplete', () => {
              // Attendre un peu que le nouveau contenu soit chargé
              gsap.delayedCall(0.1, () => {
                const nextLabel = next.container.querySelector(
                  '#manifesto > .label'
                )
                const currentLabel = current.container.querySelector(
                  '#manifesto > .label'
                )
                if (nextLabel && currentLabel) {
                  scrambleText(nextLabel, nextLabel.textContent)
                }
                textOn(next.container)
                resolve()
              })
            })
          })
        }
        return Promise.resolve()
      },
      after: ({ next, current }) => {
        initPageContent()
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        // Ne plus appeler textOn ici car il est géré dans enter pour la home
        if (next.namespace !== 'home') {
          textOn(next.container)
          // Mettre à jour le label avec scramble
          const nextLabel = next.container.querySelector('#manifesto > .label')
          const currentLabel = current.container.querySelector(
            '#manifesto > .label'
          )
          if (nextLabel && currentLabel) {
            scrambleText(nextLabel, nextLabel.textContent)
          }
        }
      },
    },
  ],
  views: [
    {
      namespace: 'home',
      beforeEnter() {
        const viewportRight = document.querySelector('.viewport_right')
        if (viewportRight && window.innerWidth >= 992) {
          viewportRight.style.width =
            window.innerWidth >= 1440 ? '60vw' : '70vw'
        }
      },
    },
  ],
})

// Ajouter un style global pour éviter les débordements pendant les transitions
const style = document.createElement('style')
style.textContent = `
  [data-barba="container"] {
    overflow: hidden;
  }
`
document.head.appendChild(style)

// Initial setup
initializeOnce()

// Handle direct URL access
document.addEventListener('DOMContentLoaded', () => {
  const namespace = document.querySelector('[data-barba="container"]')?.dataset
    .barbaNamespace

  if (namespace === 'home') {
    const viewportRight = document.querySelector('.viewport_right')
    // Ne pas forcer la largeur sur mobile/tablette (< 992px)
    if (viewportRight && window.innerWidth >= 992) {
      viewportRight.style.width = window.innerWidth >= 1440 ? '60vw' : '70vw'
    }
  }

  initPageContent()
})

let globalUpdateChevrons // Variable pour stocker la fonction updateChevrons

document.addEventListener('DOMContentLoaded', function () {
  function getRealLineCount(element) {
    const clone = element.cloneNode(true)
    const style = window.getComputedStyle(element)

    // Récupérer la valeur réelle de la variable CSS pour la taille de la police
    const fontSize = style.getPropertyValue('font-size')
    const lineHeight = style.getPropertyValue('line-height')

    // Appliquer les styles nécessaires pour la mesure
    clone.style.position = 'absolute'
    clone.style.visibility = 'hidden'
    clone.style.height = 'auto'
    clone.style.width = style.width
    clone.style.whiteSpace = 'normal'
    clone.style.padding = style.padding
    clone.style.font = style.font
    clone.style.letterSpacing = style.letterSpacing
    clone.style.wordSpacing = style.wordSpacing
    clone.style.lineHeight = lineHeight
    clone.style.maxWidth = style.maxWidth
    clone.style.fontSize = fontSize

    // Placer temporairement le clone dans le body pour mesurer
    document.body.appendChild(clone)

    // Calcul du nombre de lignes
    const totalHeight = clone.getBoundingClientRect().height
    const lineHeightNumeric = parseFloat(lineHeight)
    const lineCount = Math.round(totalHeight / lineHeightNumeric)

    // Nettoyer le clone
    document.body.removeChild(clone)

    return lineCount
  }

  function updateChevrons() {
    const targetElement = document.querySelector('#target')
    const chevronsContainer = document.querySelector('.chevrons')

    if (!targetElement || !chevronsContainer) return

    const lineCount = getRealLineCount(targetElement)

    chevronsContainer.innerHTML = ''

    // Ajouter les chevrons en fonction du nombre de lignes
    for (let i = 0; i < lineCount; i++) {
      const chevronSpan = document.createElement('span')
      chevronSpan.classList.add('chevron')
      chevronSpan.innerHTML = '&gt;'
      chevronsContainer.appendChild(chevronSpan)
    }
  }

  // Stocker la référence globalement
  globalUpdateChevrons = updateChevrons

  // Mettre à jour les chevrons au chargement initial
  updateChevrons()

  // Observer les changements de taille du terminal
  const resizeObserver = new ResizeObserver(() => {
    updateChevrons()
  })

  const terminalElement = document.querySelector('.terminal_inner')
  if (terminalElement) {
    resizeObserver.observe(terminalElement)
  }
})

// Fonction pour les chevrons du terminal
function ensureTerminalChevrons() {
  document.querySelectorAll('.is-terminal-text').forEach((element) => {
    let htmlContent = element.innerHTML
    const lines = htmlContent.split('<br>')

    const cleanedLines = lines.map((line) => {
      return line.replace(/&gt;\s*/, '')
    })

    const formattedLines = cleanedLines.map((line) => {
      const leadingSpaces = line.match(/^\s*/)[0]
      const trimmedLine = line.trim()
      return `${leadingSpaces}&gt; ${trimmedLine}`
    })

    element.innerHTML = formattedLines.join('<br>')
  })

  // Mettre à jour aussi les chevrons dynamiques si la fonction existe
  if (typeof globalUpdateChevrons === 'function') {
    globalUpdateChevrons()
  }
}

// Resize handler
window.addEventListener('resize', () => {
  const namespace = document.querySelector('[data-barba="container"]')?.dataset
    .barbaNamespace
  if (namespace === 'home') {
    const viewportRight = document.querySelector('.viewport_right')
    if (viewportRight) {
      // Ne pas forcer la largeur sur mobile/tablette (< 992px)
      if (window.innerWidth >= 992) {
        viewportRight.style.width = window.innerWidth >= 1440 ? '60vw' : '70vw'
      } else {
        // Retirer le style inline pour laisser le CSS gérer
        viewportRight.style.removeProperty('width')
      }
    }
  }
})
