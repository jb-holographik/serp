import { supabase } from '../supabaseClient'
let storedUsername = generateDefaultUsername()
let globalUpdateChevrons
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
export function initCommands() {
  const commandElements = document.querySelectorAll('.commands_item')
  commandElements.forEach((el) => {
    const name = el.getAttribute('data-command')
    const answerElement = el.querySelector('.is--answer')
    if (name && answerElement && name.toLowerCase() !== 'help') {
      if (!el.getAttribute('data-response')) {
        el.setAttribute('data-response', answerElement.innerHTML)
      }
    }
  })
  const commandsCall = document.querySelector('.commands_call')
  const commandsList = document.querySelector('.commands_list')
  if (commandsCall) commandsCall.style.display = 'none'
  if (commandsList) commandsList.style.display = 'none'
}
function processCommand(command, terminal) {
  const originalCommand = command
  const lowerCommand = command.toLowerCase()
  if (!lowerCommand.startsWith('/')) {
    const output = document.createElement('span')
    output.classList.add('is-answer')
    output.innerHTML = `&gt; Commands must start with "/". Type "/help" for available commands.`
    terminal.appendChild(output)
    terminal.scrollTop = terminal.scrollHeight
    ensureTerminalChevrons()
    return
  }
  const commandWithoutSlash = command.substring(1)
  const lowerCommandWithoutSlash = commandWithoutSlash.toLowerCase()
  const baseCommand = lowerCommandWithoutSlash.split(' ')[0]
  const silentCommands = ['user']
  if (
    !silentCommands.includes(baseCommand) &&
    !lowerCommandWithoutSlash.startsWith(' ')
  ) {
    const typed = document.createElement('span')
    typed.classList.add('is-answer')
    typed.innerHTML = `&gt; ${originalCommand}`
    terminal.appendChild(typed)
  }
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
  const style = window.getComputedStyle(element)
  const fontSize = style.fontSize
  const lineHeight =
    style.lineHeight === 'normal'
      ? `${parseInt(fontSize) * 1.2}px`
      : style.lineHeight
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
  document.body.appendChild(clone)
  const totalHeight = clone.getBoundingClientRect().height
  const lineHeightNumeric = parseFloat(lineHeight)
  const lineCount = Math.floor(totalHeight / lineHeightNumeric)
  document.body.removeChild(clone)
  return lineCount
}
function updateChevrons() {
  const targetElement = document.querySelector('#target')
  const chevronsContainer = document.querySelector('.chevrons')
  if (targetElement && chevronsContainer) {
    try {
      const lineCount = getRealLineCount(targetElement)
      chevronsContainer.innerHTML = ''
      for (let i = 0; i < lineCount; i++) {
        const chevronSpan = document.createElement('span')
        chevronSpan.classList.add('chevron')
        chevronSpan.innerHTML = '&gt;'
        chevronsContainer.appendChild(chevronSpan)
      }
      setTimeout(() => {
        const textRect = targetElement.getBoundingClientRect()
        const chevronsRect = chevronsContainer.getBoundingClientRect()
        if (textRect.height > chevronsRect.height) {
          const style = window.getComputedStyle(
            chevronsContainer.querySelector('.chevron')
          )
          const lineHeightValue = parseFloat(
            style.lineHeight === 'normal' ? style.fontSize : style.lineHeight
          )
          const missingLines = Math.ceil(
            (textRect.height - chevronsRect.height) / lineHeightValue
          )
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
  document.querySelectorAll('.is-manifesto-text').forEach((manifestoText) => {
    const manifestoChevronsContainer = manifestoText
      .closest('.manifesto_inner')
      ?.querySelector('.chevrons')
    if (manifestoText && manifestoChevronsContainer) {
      try {
        const manifestoLineCount = getRealLineCount(manifestoText)
        manifestoChevronsContainer.innerHTML = ''
        for (let i = 0; i < manifestoLineCount; i++) {
          const chevronSpan = document.createElement('span')
          chevronSpan.classList.add('chevron')
          chevronSpan.innerHTML = '&gt;'
          manifestoChevronsContainer.appendChild(chevronSpan)
        }
        setTimeout(() => {
          const textRect = manifestoText.getBoundingClientRect()
          const chevronsRect =
            manifestoChevronsContainer.getBoundingClientRect()
          if (textRect.height > chevronsRect.height) {
            const style = window.getComputedStyle(
              manifestoChevronsContainer.querySelector('.chevron')
            )
            const lineHeightValue = parseFloat(
              style.lineHeight === 'normal' ? style.fontSize : style.lineHeight
            )
            const missingLines = Math.ceil(
              (textRect.height - chevronsRect.height) / lineHeightValue
            )
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
  if (typeof globalUpdateChevrons === 'function') {
    globalUpdateChevrons()
  }
}
export { updateChevrons }
function simulateInitialState(terminal) {
  const storedName = localStorage.getItem('username')
  if (!storedName) return
  const userCommand = document.createElement('span')
  userCommand.classList.add('is-answer')
  userCommand.innerHTML = `&gt; /user ${storedName}`
  terminal.appendChild(userCommand)
  const welcomeOutput = document.createElement('span')
  welcomeOutput.classList.add('is-answer')
  welcomeOutput.innerHTML = `&gt; Welcome, ${storedName} !`
  terminal.appendChild(welcomeOutput)
  const commandsIntro = document.createElement('span')
  commandsIntro.classList.add('is-answer')
  commandsIntro.innerHTML = '&gt; Here is a list of available commands:'
  terminal.appendChild(commandsIntro)
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
  if (!messagesAlreadyLoaded) {
    loadMessages()
    messagesAlreadyLoaded = true
  }
  ensureTerminalChevrons()
  const input = document.querySelector('.input')
  if (input) {
    input.placeholder = ''
  }
}
export function initializeTerminal() {
  initCommands()
  updateWelcomeText()
  const input = document.querySelector('.input')
  const terminal = document.querySelector('.terminal_inner')
  const sendButton = document.querySelector('.button')
  const storedName = localStorage.getItem('username')
  if (storedName) {
    storedUsername = storedName
    input.placeholder = ''
    simulateInitialState(terminal)
  } else {
    input.placeholder = 'Enter "/user" + your name'
  }
  if (input && terminal && sendButton) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const command = input.value.trim()
        if (command) {
          processCommand(command, terminal)
          input.value = ''
        }
      }
    })
    sendButton.addEventListener('click', function () {
      const command = input.value.trim()
      if (command) {
        processCommand(command, terminal)
        input.value = ''
      }
    })
  }
  globalUpdateChevrons = updateChevrons
  updateChevrons()
  const resizeObserver = new ResizeObserver(() => {
    updateChevrons()
  })
  const terminalElement = document.querySelector('.terminal_inner')
  if (terminalElement) {
    resizeObserver.observe(terminalElement)
  }
  const targetElement = document.querySelector('#target')
  if (targetElement) {
    resizeObserver.observe(targetElement)
  }
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
