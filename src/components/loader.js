import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

CustomEase.create('serpeasing', 'M0,0 C0.37,0.01 0.01,0.99 1,1')

// Loader animation
export function startLoaderAnimation() {
  const loader = document.querySelector('.loader')
  const loaderWrap = document.querySelector('.loader-wrap')
  const scan = document.querySelector('.scan.is-loader-1')
  const scanLoader2 = document.querySelector('.scan.is-loader-2')
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

  // Animation simultanée de loader-wrap et scan.is-loader-2
  timeline.to(loaderWrap, {
    height: 0,
    duration: 1.8,
    ease: 'serpeasing',
    onComplete: () => {
      document.body.style.overflow = ''
      if (loader) loader.remove()
    },
  })

  // Animation de scan.is-loader-2 en parallèle avec loader-wrap
  if (scanLoader2) {
    timeline.to(
      scanLoader2,
      {
        y: '-110vh',
        duration: 1.8,
        ease: 'serpeasing',
      },
      '-=1.8'
    ) // Démarre 1.8s avant la fin, donc en même temps que loader-wrap
  }

  return timeline
}
