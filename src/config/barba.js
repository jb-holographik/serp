import barba from '@barba/core'
import { gsap } from 'gsap'

import { textOff, textOn, quitHome } from '../animations/page-transitions'
import { updateChevrons } from '../components/terminal'
import { initPageContent, updateGameControlsVisibility } from '../main'
import { scrambleText } from '../utils/text'
export function initializeBarba() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  barba.hooks.before((data) => {
    if (data.next.namespace === 'home') {
      return
    }
    document.body.classList.add('barba-transition')
    document.body.style.animation = 'hide-scrollbars 1.5s forwards'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  })
  barba.hooks.after(() => {
    window.scrollTo(0, 0)
    if (typeof updateChevrons === 'function') {
      gsap.delayedCall(0.1, updateChevrons)
    }
    if (typeof updateGameControlsVisibility === 'function') {
      gsap.delayedCall(0.1, updateGameControlsVisibility)
    }
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
    gsap.delayedCall(0.3, () => {
      document.body.classList.remove('barba-transition')
      document.body.style.animation = ''
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    })
  })
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
      const activeToggle = current?.container.querySelector(
        '.toggle_button.is-active'
      )
      const label = next.container.querySelector('.is--label')
      if (activeToggle && label) {
        const toggleRect = activeToggle.getBoundingClientRect()
        gsap.set(label, {
          position: 'absolute',
          top: toggleRect.top,
          left: toggleRect.left,
          width: toggleRect.width,
          height: toggleRect.height,
          display: 'flex',
        })
        gsap.to(label, {
          position: 'static',
          clearProps: 'all',
          duration: 0.3,
          ease: 'power2.inOut',
        })
        textOff(label)
        textOn(label)
      }
      const nextLabel = next.container.querySelector('#manifesto > .label')
      const currentLabel = current?.container.querySelector(
        '#manifesto > .label'
      )
      const nextScramble = next.container.querySelector('.is--scramble')
      const currentScramble = current?.container.querySelector('.is--scramble')
      if (nextLabel && currentLabel) {
        scrambleText(nextLabel, nextLabel.textContent)
      }
      if (nextScramble && currentScramble) {
        scrambleText(nextScramble, nextScramble.textContent)
      }
      return Promise.resolve()
    },
    after() {
      initPageContent()
    },
  }
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
  barba.init({
    prevent: ({ el }) => {
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
  barba.hooks.enter((data) => {
    if (data.next.namespace === 'home') {
      return
    }
    gsap.delayedCall(1, () => {
      if (data.next.container.style.opacity === '0') {
        gsap.to(data.next.container, { opacity: 1, duration: 0.3 })
      }
    })
  })
  window.addEventListener('error', (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes('barba')
    ) {
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
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname
    if (currentPath === '/' || currentPath === '/index.html') {
      window.location.reload()
      return
    }
    if (barba.history && barba.history.current) {
      barba.history.current.trigger = 'back'
    }
  })
}
