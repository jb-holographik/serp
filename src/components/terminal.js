import { supabase } from '../supabaseClient'

// Terminal commands and username
let storedUsername = generateDefaultUsername()
let globalUpdateChevrons // Variable pour stocker la fonction updateChevrons
let messagesAlreadyLoaded = false

export function generateDefaultUsername() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000)
  return `anon${randomDigits}`
}

export function updateWelcomeText() {
  const welcomeElement = document.querySelector('.welcome')
  if (welcomeElement) {
    welcomeElement.textContent = `Welcome, ${storedUsername} !`
  }
}

// Initialize commands from DOM
export function initCommands() {
  const commandElements = document.querySelectorAll('.commands_item')
  commandElements.forEach((el) => {
    const name = el.getAttribute('data-command')
    const answerElement = el.querySelector('.is--answer')
    if (name && answerElement && name.toLowerCase() !== 'help') {
      // Stocker la réponse dans data-response si elle n'existe pas déjà
      if (!el.getAttribute('data-response')) {
        el.setAttribute('data-response', answerElement.innerHTML)
      }
    }
  })

  // Cacher à la fois commands_call et commands_list
  const commandsCall = document.querySelector('.commands_call')
  const commandsList = document.querySelector('.commands_list')
  if (commandsCall) commandsCall.style.display = 'none'
  if (commandsList) commandsList.style.display = 'none'
}

// Process terminal commands
function processCommand(command, terminal) {
  const originalCommand = command
  const lowerCommand = command.toLowerCase()

  // Vérifier si la commande commence par "/"
  if (!lowerCommand.startsWith('/')) {
    const output = document.createElement('span')
    output.classList.add('is-answer')
    output.innerHTML = `&gt; Commands must start with "/". Type "/help" for available commands.`
    terminal.appendChild(output)
    terminal.scrollTop = terminal.scrollHeight
    ensureTerminalChevrons()
    return
  }

  // Enlever le "/" du début
  const commandWithoutSlash = command.substring(1)
  const lowerCommandWithoutSlash = commandWithoutSlash.toLowerCase()
  const baseCommand = lowerCommandWithoutSlash.split(' ')[0]

  // Commandes à ne pas afficher dans le terminal (car gérées autrement)
  const silentCommands = ['user']

  // Afficher la commande tapée (avec le /) sauf pour les commandes silencieuses et les messages
  if (
    !silentCommands.includes(baseCommand) &&
    !lowerCommandWithoutSlash.startsWith(' ')
  ) {
    const typed = document.createElement('span')
    typed.classList.add('is-answer')
    typed.innerHTML = `&gt; ${originalCommand}`
    terminal.appendChild(typed)
  }

  // Commande help
  if (lowerCommandWithoutSlash === 'help') {
    const commandItems = document
      .querySelector('.commands_list')
      .querySelectorAll('.commands_item')
    commandItems.forEach((item, index) => {
      setTimeout(() => {
        const commandLine = document.createElement('div')
        commandLine.classList.add('is-answer', 'commands_item')
        commandLine.style.display = 'flex'
        commandLine.innerHTML = `&gt;&nbsp;/${item.innerHTML}`
        terminal.appendChild(commandLine)
        terminal.scrollTop = terminal.scrollHeight

        if (index === commandItems.length - 1) {
          ensureTerminalChevrons()
        }
      }, index * 100)
    })
    return
  }

  // Commande user
  if (lowerCommandWithoutSlash.startsWith('user ')) {
    const name = commandWithoutSlash.slice(5).trim()
    if (name) {
      storedUsername = name
      localStorage.setItem('username', name)

      const input = document.querySelector('.input')
      if (input) input.placeholder = ''

      setTimeout(() => {
        const welcomeOutput = document.createElement('span')
        welcomeOutput.classList.add('is-answer')
        welcomeOutput.innerHTML = `&gt; Welcome, ${storedUsername} !`
        terminal.appendChild(welcomeOutput)
        terminal.scrollTop = terminal.scrollHeight

        setTimeout(() => {
          const commandsIntro = document.createElement('span')
          commandsIntro.classList.add('is-answer')
          commandsIntro.innerHTML = '&gt; Here is a list of available commands:'
          terminal.appendChild(commandsIntro)
          terminal.scrollTop = terminal.scrollHeight

          const commandItems = document
            .querySelector('.commands_list')
            .querySelectorAll('.commands_item')
          commandItems.forEach((item, index) => {
            setTimeout(() => {
              const commandLine = document.createElement('div')
              commandLine.classList.add('is-answer', 'commands_item')
              commandLine.style.display = 'flex'
              commandLine.innerHTML = `&gt;&nbsp;/${item.innerHTML}`
              terminal.appendChild(commandLine)
              terminal.scrollTop = terminal.scrollHeight

              if (index === commandItems.length - 1) {
                ensureTerminalChevrons()

                // Charger les messages après affichage des commandes
                if (!messagesAlreadyLoaded) {
                  loadMessages()
                  messagesAlreadyLoaded = true
                }
              }
            }, index * 100 + 100)
          })
        }, 400)
      }, 100)
    } else {
      const output = document.createElement('span')
      output.classList.add('is-answer')
      output.innerHTML = `&gt; Veuillez entrer un nom après "/user"`
      terminal.appendChild(output)
      terminal.scrollTop = terminal.scrollHeight
      ensureTerminalChevrons()
    }
    return
  }

  // Message (commence par / suivi d'un espace)
  if (lowerCommandWithoutSlash.startsWith(' ')) {
    const message = commandWithoutSlash.slice(1).trim()
    storedUsername = localStorage.getItem('username') || storedUsername

    if (!storedUsername || !message) return

    const MAX_LENGTH = 280

    if (message.length > MAX_LENGTH) {
      const errorLine = document.createElement('div')
      errorLine.classList.add('is-answer')
      errorLine.textContent = `> Message too long (${message.length}/${MAX_LENGTH}). Limit is ${MAX_LENGTH} characters.`
      terminal.appendChild(errorLine)
      terminal.scrollTop = terminal.scrollHeight
      return
    }

    // Ne pas afficher ici, le realtime s'en occupe
    supabase
      .from('messages')
      .insert([{ user: storedUsername, content: message }])
      .then(({ error }) => {
        if (error) {
          const errorLine = document.createElement('div')
          errorLine.classList.add('is-answer')
          errorLine.textContent = `> Message not sent.`
          terminal.appendChild(errorLine)
        }
      })

    return
  }

  // Commande serp
  if (lowerCommandWithoutSlash === 'serp') {
    const asciiElement = document.querySelector('.is--ascii')
    if (asciiElement) {
      setTimeout(() => {
        const outputLine = document.createElement('span')
        outputLine.classList.add('is-answer')
        outputLine.innerHTML = `&gt; ${asciiElement.innerHTML}`
        terminal.appendChild(outputLine)
        terminal.scrollTop = terminal.scrollHeight
        ensureTerminalChevrons()
      }, 100)
      return
    }
  }

  // Autres commandes prédéfinies
  const commandItem = document.querySelector(
    `.commands_item[data-command="${commandWithoutSlash}"]`
  )
  if (commandItem) {
    const responseText = commandItem.getAttribute('data-response')
    if (responseText) {
      if (commandWithoutSlash === '26-7') {
        const responses = responseText
          .split('---')
          .map((s) => s.trim())
          .filter(Boolean)
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)]

        const lines = randomResponse.split('\n')
        lines.forEach((line, index) => {
          setTimeout(() => {
            const outputLine = document.createElement('span')
            outputLine.classList.add('is-answer')
            const replacedLine = line.replace(/\[name\]/gi, storedUsername)
            outputLine.innerHTML = `&gt; ${replacedLine}`
            terminal.appendChild(outputLine)
            terminal.scrollTop = terminal.scrollHeight

            if (index === lines.length - 1) {
              ensureTerminalChevrons()
            }
          }, index * 100)
        })
        return
      }

      // Réponse normale
      const lines = responseText.split('\n')
      lines.forEach((line, index) => {
        setTimeout(() => {
          const outputLine = document.createElement('span')
          outputLine.classList.add('is-answer')
          const replacedLine = line.replace(/\[name\]/gi, storedUsername)
          outputLine.innerHTML = `&gt; ${replacedLine}`
          terminal.appendChild(outputLine)
          terminal.scrollTop = terminal.scrollHeight

          if (index === lines.length - 1) {
            ensureTerminalChevrons()
          }
        }, index * 100)
      })
    }
  } else {
    setTimeout(() => {
      const output = document.createElement('span')
      output.classList.add('is-answer')
      output.innerHTML = `&gt; Command not found: "/${commandWithoutSlash}"`
      terminal.appendChild(output)
      terminal.scrollTop = terminal.scrollHeight
      ensureTerminalChevrons()
    }, 100)
  }
}

function getRealLineCount(element) {
  // Obtenir le style de l'élément
  const style = window.getComputedStyle(element)
  const fontSize = style.fontSize
  const lineHeight =
    style.lineHeight === 'normal'
      ? `${parseInt(fontSize) * 1.2}px`
      : style.lineHeight

  // Créer un clone de l'élément pour mesurer
  const clone = element.cloneNode(true)
  clone.style.position = 'absolute'
  clone.style.visibility = 'hidden'
  clone.style.width = style.width
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

  // Calcul intentionnellement conservateur pour éviter l'excès de chevrons
  const lineCount = Math.floor(totalHeight / lineHeightNumeric)

  // Nettoyer le clone
  document.body.removeChild(clone)

  return lineCount
}

function updateChevrons() {
  // Mettre à jour les chevrons pour l'élément #target
  const targetElement = document.querySelector('#target')
  const chevronsContainer = document.querySelector('.chevrons')

  if (targetElement && chevronsContainer) {
    try {
      // Calcul conservateur du nombre de lignes initial
      const lineCount = getRealLineCount(targetElement)
      chevronsContainer.innerHTML = ''

      // Ajouter les chevrons en fonction du nombre de lignes
      for (let i = 0; i < lineCount; i++) {
        const chevronSpan = document.createElement('span')
        chevronSpan.classList.add('chevron')
        chevronSpan.innerHTML = '&gt;'
        chevronsContainer.appendChild(chevronSpan)
      }

      // Attendre que le rendu soit fait puis ajuster les chevrons
      setTimeout(() => {
        // Hauteur réelle du texte
        const textRect = targetElement.getBoundingClientRect()
        // Hauteur réelle des chevrons actuels
        const chevronsRect = chevronsContainer.getBoundingClientRect()

        // Si le texte est plus grand que les chevrons, ajouter des chevrons manquants
        if (textRect.height > chevronsRect.height) {
          const style = window.getComputedStyle(
            chevronsContainer.querySelector('.chevron')
          )
          const lineHeightValue = parseFloat(
            style.lineHeight === 'normal' ? style.fontSize : style.lineHeight
          )

          // Ne calculer que les chevrons manquants (et pas plus)
          const missingLines = Math.ceil(
            (textRect.height - chevronsRect.height) / lineHeightValue
          )

          // Ajouter seulement les chevrons manquants
          for (let i = 0; i < missingLines; i++) {
            const extraChevron = document.createElement('span')
            extraChevron.classList.add('chevron')
            extraChevron.innerHTML = '&gt;'
            chevronsContainer.appendChild(extraChevron)
          }
        }
      }, 50)
    } catch (error) {
      console.error('Erreur lors de la mise à jour des chevrons:', error)
    }
  }

  // Mettre à jour les chevrons pour les éléments is-manifesto-text
  document.querySelectorAll('.is-manifesto-text').forEach((manifestoText) => {
    // Trouver le container de chevrons le plus proche
    const manifestoChevronsContainer = manifestoText
      .closest('.manifesto_inner')
      ?.querySelector('.chevrons')

    if (manifestoText && manifestoChevronsContainer) {
      try {
        // Calcul conservateur du nombre de lignes initial
        const manifestoLineCount = getRealLineCount(manifestoText)
        manifestoChevronsContainer.innerHTML = ''

        // Ajouter les chevrons en fonction du nombre de lignes
        for (let i = 0; i < manifestoLineCount; i++) {
          const chevronSpan = document.createElement('span')
          chevronSpan.classList.add('chevron')
          chevronSpan.innerHTML = '&gt;'
          manifestoChevronsContainer.appendChild(chevronSpan)
        }

        // Attendre que le rendu soit fait puis ajuster les chevrons
        setTimeout(() => {
          // Hauteur réelle du texte
          const textRect = manifestoText.getBoundingClientRect()
          // Hauteur réelle des chevrons actuels
          const chevronsRect =
            manifestoChevronsContainer.getBoundingClientRect()

          // Si le texte est plus grand que les chevrons, ajouter des chevrons manquants
          if (textRect.height > chevronsRect.height) {
            const style = window.getComputedStyle(
              manifestoChevronsContainer.querySelector('.chevron')
            )
            const lineHeightValue = parseFloat(
              style.lineHeight === 'normal' ? style.fontSize : style.lineHeight
            )

            // Ne calculer que les chevrons manquants (et pas plus)
            const missingLines = Math.ceil(
              (textRect.height - chevronsRect.height) / lineHeightValue
            )

            // Ajouter seulement les chevrons manquants
            for (let i = 0; i < missingLines; i++) {
              const extraChevron = document.createElement('span')
              extraChevron.classList.add('chevron')
              extraChevron.innerHTML = '&gt;'
              manifestoChevronsContainer.appendChild(extraChevron)
            }
          }
        }, 50)
      } catch (error) {
        console.error(
          'Erreur lors de la mise à jour des chevrons (manifesto):',
          error
        )
      }
    }
  })
}

// Fonction pour les chevrons du terminal
export function ensureTerminalChevrons() {
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

// Exporter la fonction updateChevrons pour l'utiliser dans main.js
export { updateChevrons }

// Fonction pour simuler l'état initial du terminal
function simulateInitialState(terminal) {
  const storedName = localStorage.getItem('username')
  if (!storedName) return

  // Simuler la commande user
  const userCommand = document.createElement('span')
  userCommand.classList.add('is-answer')
  userCommand.innerHTML = `&gt; /user ${storedName}`
  terminal.appendChild(userCommand)

  // Simuler le message de bienvenue
  const welcomeOutput = document.createElement('span')
  welcomeOutput.classList.add('is-answer')
  welcomeOutput.innerHTML = `&gt; Welcome, ${storedName} !`
  terminal.appendChild(welcomeOutput)

  // Simuler l'introduction des commandes
  const commandsIntro = document.createElement('span')
  commandsIntro.classList.add('is-answer')
  commandsIntro.innerHTML = '&gt; Here is a list of available commands:'
  terminal.appendChild(commandsIntro)

  // Afficher la liste des commandes
  const commandItems = document
    .querySelector('.commands_list')
    .querySelectorAll('.commands_item')
  commandItems.forEach((item) => {
    const commandLine = document.createElement('div')
    commandLine.classList.add('is-answer', 'commands_item')
    commandLine.style.display = 'flex'
    commandLine.innerHTML = `&gt;&nbsp;/${item.innerHTML}`
    terminal.appendChild(commandLine)
  })

  // Charger les messages si ce n'est pas déjà fait
  if (!messagesAlreadyLoaded) {
    loadMessages()
    messagesAlreadyLoaded = true
  }

  // S'assurer que les chevrons sont correctement affichés
  ensureTerminalChevrons()

  // Mettre à jour le placeholder de l'input
  const input = document.querySelector('.input')
  if (input) {
    input.placeholder = ''
  }
}

// Initialize terminal
export function initializeTerminal() {
  // Initialize commands
  initCommands()
  updateWelcomeText()

  // Get DOM elements
  const input = document.querySelector('.input')
  const terminal = document.querySelector('.terminal_inner')
  const sendButton = document.querySelector('.button')

  // Vérifier si un nom d'utilisateur est déjà stocké
  const storedName = localStorage.getItem('username')
  if (storedName) {
    storedUsername = storedName
    input.placeholder = ''
    simulateInitialState(terminal)
  } else {
    input.placeholder = 'Enter "/user" + your name'
  }

  // Initialize terminal commands if elements exist
  if (input && terminal && sendButton) {
    // Handle keyboard input
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const command = input.value.trim()
        if (command) {
          processCommand(command, terminal)
          input.value = ''
        }
      }
    })

    // Handle button click
    sendButton.addEventListener('click', function () {
      const command = input.value.trim()
      if (command) {
        processCommand(command, terminal)
        input.value = ''
      }
    })
  }

  // Initialize chevrons
  globalUpdateChevrons = updateChevrons
  updateChevrons()

  // Observer les changements de taille du terminal
  const resizeObserver = new ResizeObserver(() => {
    updateChevrons()
  })

  const terminalElement = document.querySelector('.terminal_inner')
  if (terminalElement) {
    resizeObserver.observe(terminalElement)
  }

  // Observer également les changements de taille de l'élément #target s'il existe
  const targetElement = document.querySelector('#target')
  if (targetElement) {
    resizeObserver.observe(targetElement)
  }

  // Initialize other features
  ensureTerminalChevrons()
  subscribeToNewMessages()
}

async function loadMessages() {
  const terminal = document.querySelector('.terminal_inner')
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    const errorLine = document.createElement('div')
    errorLine.classList.add('is-answer')
    errorLine.textContent = `Erreur lors du chargement des messages.`
    terminal.appendChild(errorLine)
    terminal.scrollTop = terminal.scrollHeight
    return
  }
  const messages = (data || []).reverse()

  messages.forEach((msg) => {
    const messageLine = document.createElement('div')
    messageLine.classList.add('is-answer')
    messageLine.innerHTML = `&gt; [${msg.user}] ${msg.content}`
    terminal.appendChild(messageLine)
    terminal.scrollTop = terminal.scrollHeight
  })
}

function subscribeToNewMessages() {
  supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new
        const terminal = document.querySelector('.terminal_inner')

        const line = document.createElement('div')
        line.classList.add('is-answer')

        // Ajoute une classe spéciale si c'est l'utilisateur local
        if (msg.user === storedUsername) {
          line.classList.add('from-me')
        }

        line.innerHTML = `&gt; [${msg.user}] ${msg.content}`
        terminal.appendChild(line)
        terminal.scrollTop = terminal.scrollHeight
      }
    )
    .subscribe()
}
