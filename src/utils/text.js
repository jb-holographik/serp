export function scrambleText(element, finalText, options = {}) {
  const {
    speed = 50,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?/[]{}',
    revealDelay = 0,
  } = options

  if (!element || !finalText) return

  let output = ''
  let revealed = 0

  // Démarrer après le délai spécifié
  setTimeout(() => {
    const scrambleInterval = setInterval(() => {
      output = ''

      for (let i = 0; i < finalText.length; i++) {
        if (i < revealed) {
          output += finalText[i]
        } else if (finalText[i] === ' ') {
          output += ' '
        } else {
          output += chars.charAt(Math.floor(Math.random() * chars.length))
        }
      }

      element.textContent = output

      if (revealed < finalText.length) {
        revealed++
      } else {
        clearInterval(scrambleInterval)
        element.textContent = finalText
      }
    }, speed)
  }, revealDelay)
}

export function typewriterEffect(element, text, options = {}) {
  const { speed = 100, cursor = true, cursorChar = '_' } = options

  if (!element) return

  let i = 0
  element.textContent = cursor ? cursorChar : ''

  const typeInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent = text.slice(0, i + 1) + (cursor ? cursorChar : '')
      i++
    } else {
      clearInterval(typeInterval)
      if (!cursor) {
        element.textContent = text
      } else {
        // Animation du curseur clignotant
        setInterval(() => {
          const currentText = element.textContent
          if (currentText.endsWith(cursorChar)) {
            element.textContent = text
          } else {
            element.textContent = text + cursorChar
          }
        }, 500)
      }
    }
  }, speed)
}
