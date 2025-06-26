import { gsap } from 'gsap'

import { updateGameControlsVisibility } from '../main'
function hideControls() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const controls = document.querySelector('.game-controls')
    if (controls) {
      if (window.matchMedia('(min-width: 997px)').matches) {
        controls.style.display = 'none'
        controls.style.visibility = 'hidden'
      } else {
        controls.style.display = ''
        controls.style.visibility = 'visible'
      }
    }
  }
}
let gameInstance = null
let preloadedAssets = null
function preloadGameAssets() {
  if (preloadedAssets) return preloadedAssets
  const assets = {
    snakeHeadImg: null,
    snakeTailImg: null,
  }
  const computedStyle = getComputedStyle(document.documentElement)
  const serpRed = computedStyle
    .getPropertyValue('--base-colors--serp-red')
    .trim()
  const snakeHead = document.querySelector('.snake-head')
  if (snakeHead) {
    const snakeHeadSVG = snakeHead.cloneNode(true)
    snakeHeadSVG.removeAttribute('style')
    snakeHeadSVG.setAttribute('width', '100%')
    snakeHeadSVG.setAttribute('height', '100%')
    snakeHeadSVG.setAttribute('viewBox', '0 0 7 7')
    const allElements = snakeHeadSVG.getElementsByTagName('*')
    for (let element of allElements) {
      element.setAttribute('fill', serpRed)
    }
    snakeHeadSVG.setAttribute('fill', serpRed)
    const svgString = new XMLSerializer().serializeToString(snakeHeadSVG)
    const encodedSvg = encodeURIComponent(svgString)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
    const img = new Image()
    img.src = dataUrl
    assets.snakeHeadImg = img
  }
  const snakeTail = document.querySelector('.snake-tail')
  if (snakeTail) {
    const snakeTailSVG = snakeTail.cloneNode(true)
    snakeTailSVG.removeAttribute('style')
    snakeTailSVG.setAttribute('width', '100%')
    snakeTailSVG.setAttribute('height', '100%')
    snakeTailSVG.setAttribute('viewBox', '0 0 7 7')
    const allElements = snakeTailSVG.getElementsByTagName('*')
    for (let element of allElements) {
      element.setAttribute('fill', serpRed)
    }
    snakeTailSVG.setAttribute('fill', serpRed)
    const svgString = new XMLSerializer().serializeToString(snakeTailSVG)
    const encodedSvg = encodeURIComponent(svgString)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
    const img = new Image()
    img.src = dataUrl
    assets.snakeTailImg = img
  }
  preloadedAssets = assets
  return assets
}
class SnakeGame {
  constructor(container) {
    if (gameInstance) {
      console.warn(
        'Game instance already exists, use SnakeGame.initialize() instead'
      )
      return gameInstance
    }
    this.container = container
    this.canvas = null
    this.ctx = null
    this.snake = null
    this.direction = null
    this.food = null
    this.interval = null
    this.animationFrameId = null
    this.resizeObserver = null
    this.resizeTimeout = null
    this.score = 0
    this.bestScore = this.loadBestScore()
    this.directionQueue = []
    const assets = preloadGameAssets()
    this.snakeHeadImg = assets.snakeHeadImg
    this.snakeTailImg = assets.snakeTailImg
    this.cellMinSize = 20
    this.gridSize = 0
    this.cellWidth = 0
    this.cellHeight = 0
    this.totalRows = 0
    this.gameSpeed = this.isMobileOrTablet() ? 170 : 100
    this.lostScreen = document.querySelector('.game_lost')
    this.restartBtn = document.getElementById('restart')
    this.scoreElement = document.getElementById('score')
    this.bestScoreElement = document.getElementById('best-score')
    this.gameControls = document.querySelector('.game-controls')
    const computedStyle = getComputedStyle(document.documentElement)
    this.serpRed = computedStyle
      .getPropertyValue('--base-colors--serp-red')
      .trim()
    this.black = computedStyle.getPropertyValue('--base-colors--black').trim()
    this.initialize()
    this.updateScore()
    this.updateBestScore()
  }
  static initialize() {
    const namespace = document.querySelector('[data-barba="container"]')
      ?.dataset.barbaNamespace
    if (namespace !== 'home') {
      return null
    }
    const container = document.querySelector('.game_inner')
    if (!container) {
      return null
    }
    if (gameInstance) {
      gameInstance.container = container
      gameInstance.initialize()
      return gameInstance
    }
    gameInstance = new SnakeGame(container)
    return gameInstance
  }
  initialize() {
    const oldScoreDisplay = this.container.querySelector('.score-display')
    if (oldScoreDisplay) {
      oldScoreDisplay.remove()
    }
    const scoreDisplay = document.createElement('div')
    scoreDisplay.className = 'score-display'
    scoreDisplay.style.position = 'absolute'
    scoreDisplay.style.top = '10px'
    scoreDisplay.style.right = '10px'
    scoreDisplay.style.color = 'var(--base-colors--serp-red)'
    scoreDisplay.style.fontFamily = 'ABC Monument Grotesk Mono'
    scoreDisplay.style.fontSize = '0.75rem'
    scoreDisplay.style.textTransform = 'uppercase'
    scoreDisplay.style.zIndex = '1'
    this.container.appendChild(scoreDisplay)
    const oldCanvas = this.container.querySelector('.game-canvas')
    if (oldCanvas) {
      oldCanvas.remove()
    }
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'game-canvas'
    this.canvas.id = 'game-canvas'
    this.canvas.style.display = 'block'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.setupEventListeners()
    this.bestScoreElement = document.getElementById('best-score')
    if (this.bestScoreElement) {
      this.updateBestScore()
    }
    this.resizeCanvas()
    this.startGame()
  }
  setupEventListeners() {
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100)
    })
    this.resizeObserver.observe(this.container)
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100)
    })
    const mobileControls = document.querySelectorAll('.game-controls_arrow')
    const handleMobileControl = (button) => {
      const directionButtonMap = {
        'is--up': -this.gridSize,
        'is--down': this.gridSize,
        'is--left': -1,
        'is--right': 1,
      }
      for (const cls of button.classList) {
        if (directionButtonMap[cls] !== undefined) {
          const newDirection = directionButtonMap[cls]
          const lastDirection =
            this.directionQueue.length > 0
              ? this.directionQueue[this.directionQueue.length - 1]
              : this.direction
          if (newDirection !== lastDirection) {
            this.directionQueue.push(newDirection)
            if (this.directionQueue.length > 2) {
              this.directionQueue = this.directionQueue.slice(-2)
            }
          }
          break
        }
      }
    }
    mobileControls.forEach((button) => {
      button.addEventListener('click', () => handleMobileControl(button))
    })
    this.mobileControls = mobileControls
    this.handleMobileControl = handleMobileControl
    if (this.isMobileOrTablet() && this.gameControls) {
      this.gameControls.style.visibility = 'visible'
    }
    document.addEventListener('keydown', (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return
      }
      let newDirection
      const key = e.key
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'w',
          'W',
          'a',
          'A',
          's',
          'S',
          'd',
          'D',
        ].includes(key)
      ) {
        e.preventDefault()
      }
      switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDirection = -this.gridSize
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          newDirection = this.gridSize
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDirection = -1
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDirection = 1
          break
        default:
          return
      }
      const lastDirection =
        this.directionQueue.length > 0
          ? this.directionQueue[this.directionQueue.length - 1]
          : this.direction
      if (newDirection !== lastDirection) {
        this.directionQueue.push(newDirection)
        if (this.directionQueue.length > 2) {
          this.directionQueue = this.directionQueue.slice(-2)
        }
      }
    })
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        if (this.isMobileOrTablet()) {
          if (this.restartBtn) this.restartBtn.style.display = 'none'
          if (this.gameControls) this.gameControls.style.visibility = 'visible'
        }
        this.startGame()
      })
    }
  }
  resizeCanvas() {
    const containerRect = this.container.getBoundingClientRect()
    this.canvas.width = containerRect.width
    this.canvas.height = containerRect.height
    const byCols = {
      cols: Math.floor(containerRect.width / this.cellMinSize),
    }
    byCols.cellWidth = containerRect.width / byCols.cols
    byCols.rows = Math.floor(containerRect.height / byCols.cellWidth)
    byCols.cellHeight = containerRect.height / byCols.rows
    byCols.ratio = Math.abs(byCols.cellWidth - byCols.cellHeight)
    const byRows = {
      rows: Math.floor(containerRect.height / this.cellMinSize),
    }
    byRows.cellHeight = containerRect.height / byRows.rows
    byRows.cols = Math.floor(containerRect.width / byRows.cellHeight)
    byRows.cellWidth = containerRect.width / byRows.cols
    byRows.ratio = Math.abs(byRows.cellWidth - byRows.cellHeight)
    const best = byCols.ratio < byRows.ratio ? byCols : byRows
    this.gridSize = best.cols
    this.totalRows = best.rows
    this.cellWidth = best.cellWidth
    this.cellHeight = best.cellHeight
    const newSpeed = this.isMobileOrTablet() ? 170 : 100
    this.gameSpeed = newSpeed
    if (this.food !== null) {
      const foodCol = this.food % this.gridSize
      const foodRow = Math.floor(this.food / this.gridSize)
      if (
        foodCol < 0 ||
        foodCol >= this.gridSize ||
        foodRow < 0 ||
        foodRow >= this.totalRows
      ) {
        this.placeFood()
      }
    }
    if (this.snake) {
      clearInterval(this.interval)
      const relativePositions = this.snake.map((index) => ({
        x: index % this.gridSize,
        y: Math.floor(index / this.gridSize),
      }))
      const validPositions = relativePositions.filter(
        (pos) => pos.y < this.totalRows
      )
      if (validPositions.length < this.snake.length) {
        this.startGame()
      } else {
        this.snake = validPositions.map((pos) => pos.y * this.gridSize + pos.x)
        this.draw()
        this.interval = setInterval(() => this.move(), this.gameSpeed)
      }
    }
  }
  startGame() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.interval) {
      clearInterval(this.interval)
    }
    const middleCol = Math.floor(this.gridSize / 2)
    const middleRow = Math.floor(this.totalRows / 2)
    const middleCell = middleRow * this.gridSize + middleCol
    this.snake = [middleCell, middleCell - 1, middleCell - 2]
    this.direction = 1
    this.directionQueue = []
    this.score = 0
    this.gameSpeed = this.isMobileOrTablet() ? 170 : 100
    this.updateScore()
    this.updateBestScore()
    if (typeof updateGameControlsVisibility === 'function') {
      updateGameControlsVisibility()
    }
    this.placeFood()
    if (
      isNaN(this.food) ||
      this.food < 0 ||
      this.food >= this.gridSize * this.totalRows
    ) {
      this.placeFood()
    }
    if (this.lostScreen) {
      this.lostScreen.style.display = 'none'
    }
    this.draw()
    this.interval = setInterval(() => this.move(), this.gameSpeed)
  }
  draw() {
    this.ctx.fillStyle = this.black
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.snake.forEach((index, i) => {
      const cellX = (index % this.gridSize) * this.cellWidth
      const cellY = Math.floor(index / this.gridSize) * this.cellHeight
      if (i === 0 && this.snakeHeadImg) {
        this.ctx.save()
        const centerX = cellX + this.cellWidth / 2
        const centerY = cellY + this.cellHeight / 2
        this.ctx.translate(centerX, centerY)
        let rotation = 0
        switch (this.direction) {
          case 1:
            rotation = 90
            break
          case -1:
            rotation = -90
            break
          case this.gridSize:
            rotation = 180
            break
          case -this.gridSize:
            rotation = 0
            break
        }
        this.ctx.rotate((rotation * Math.PI) / 180)
        const minDim = Math.min(this.cellWidth, this.cellHeight)
        const headWidth =
          this.direction === 1 || this.direction === -1
            ? minDim
            : this.cellWidth
        const headHeight =
          this.direction === 1 || this.direction === -1
            ? this.cellHeight
            : minDim
        this.ctx.drawImage(
          this.snakeHeadImg,
          -headWidth / 2,
          -headHeight / 2,
          headWidth,
          headHeight
        )
        this.ctx.restore()
      } else if (i === this.snake.length - 1 && this.snakeTailImg) {
        this.ctx.save()
        let tailDir = 0
        if (this.snake.length > 1) {
          const tail = this.snake[this.snake.length - 1]
          const beforeTail = this.snake[this.snake.length - 2]
          let relativeDiff = beforeTail - tail
          if (
            beforeTail % this.gridSize === 0 &&
            tail % this.gridSize === this.gridSize - 1
          ) {
            relativeDiff = 1
          } else if (
            beforeTail % this.gridSize === this.gridSize - 1 &&
            tail % this.gridSize === 0
          ) {
            relativeDiff = -1
          } else if (
            beforeTail < this.gridSize &&
            tail >= this.gridSize * (this.totalRows - 1)
          ) {
            relativeDiff = this.gridSize
          } else if (
            beforeTail >= this.gridSize * (this.totalRows - 1) &&
            tail < this.gridSize
          ) {
            relativeDiff = -this.gridSize
          }
          if (relativeDiff === 1) tailDir = 90
          else if (relativeDiff === -1) tailDir = -90
          else if (relativeDiff === this.gridSize) tailDir = 180
          else if (relativeDiff === -this.gridSize) tailDir = 0
        }
        const centerX = cellX + this.cellWidth / 2
        const centerY = cellY + this.cellHeight / 2
        this.ctx.translate(centerX, centerY)
        this.ctx.rotate((tailDir * Math.PI) / 180)
        this.ctx.drawImage(
          this.snakeTailImg,
          -this.cellWidth / 2,
          -this.cellHeight / 2,
          this.cellWidth,
          this.cellHeight
        )
        this.ctx.restore()
      } else {
        this.ctx.fillStyle = this.serpRed
        this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight)
      }
    })
    if (this.food !== null) {
      const foodCol = this.food % this.gridSize
      const foodRow = Math.floor(this.food / this.gridSize)
      const x = foodCol * this.cellWidth
      const y = foodRow * this.cellHeight
      let fontSize = Math.min(this.cellWidth, this.cellHeight) * 0.8
      if (fontSize < 12) fontSize = 12
      this.ctx.font = `${fontSize}px "Press Start 2P", Impact, sans-serif`
      this.ctx.fillStyle = this.serpRed
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      if (
        foodCol >= 0 &&
        foodCol < this.gridSize &&
        foodRow >= 0 &&
        foodRow < this.totalRows
      ) {
        this.ctx.fillText('$', x + this.cellWidth / 2, y + this.cellHeight / 2)
      }
    }
  }
  move() {
    if (this.directionQueue.length > 0) {
      const nextDir = this.directionQueue.shift()
      const isValidMove =
        (nextDir === 1 && this.direction !== -1) ||
        (nextDir === -1 && this.direction !== 1) ||
        (nextDir === this.gridSize && this.direction !== -this.gridSize) ||
        (nextDir === -this.gridSize && this.direction !== this.gridSize)
      if (isValidMove) {
        this.direction = nextDir
      }
    }
    let head = this.snake[0]
    let next
    if (this.direction === 1 && head % this.gridSize === this.gridSize - 1) {
      next = head - (this.gridSize - 1)
    } else if (this.direction === -1 && head % this.gridSize === 0) {
      next = head + (this.gridSize - 1)
    } else if (this.direction === -this.gridSize && head < this.gridSize) {
      next = head + this.gridSize * (this.totalRows - 1)
    } else if (
      this.direction === this.gridSize &&
      head >= this.gridSize * (this.totalRows - 1)
    ) {
      next = head - this.gridSize * (this.totalRows - 1)
    } else {
      next = head + this.direction
    }
    if (this.snake.includes(next)) {
      this.endGame()
      return
    }
    this.snake.unshift(next)
    if (next === this.food) {
      this.score++
      this.updateScore()
      this.placeFood()
    } else {
      this.snake.pop()
    }
    this.draw()
  }
  placeFood() {
    if (this.gridSize <= 0 || this.totalRows <= 0) {
      return
    }
    let newFood
    let attempts = 0
    const maxAttempts = 100
    do {
      const randomRow = Math.floor(Math.random() * this.totalRows)
      const randomCol = Math.floor(Math.random() * this.gridSize)
      newFood = randomRow * this.gridSize + randomCol
      attempts++
      if (attempts >= maxAttempts) {
        return
      }
    } while (this.snake.includes(newFood))
    this.food = newFood
  }
  endGame() {
    clearInterval(this.interval)
    cancelAnimationFrame(this.animationFrameId)
    if (this.lostScreen) {
      this.lostScreen.style.display = 'flex'
    }
    if (this.isMobileOrTablet()) {
      if (this.gameControls) {
        this.gameControls.style.visibility = 'hidden'
      }
      if (this.restartBtn) {
        this.restartBtn.style.display = 'flex'
      }
    } else {
      if (this.gameControls) {
        this.gameControls.style.visibility = 'hidden'
      }
      if (this.restartBtn) {
        this.restartBtn.style.display = 'flex'
      }
    }
  }
  updateScore() {
    if (this.scoreElement) {
      this.scoreElement.textContent = this.score
    }
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.saveBestScore(this.score)
      this.updateBestScore()
    }
  }
  updateBestScore() {
    if (this.bestScoreElement) {
      this.bestScoreElement.textContent = this.bestScore
      gsap.set(this.bestScoreElement, {
        display: 'inline-block',
        opacity: 1,
        visibility: 'visible',
      })
      const parent = this.bestScoreElement.parentElement
      if (parent) {
        gsap.set(parent, {
          display: 'flex',
          opacity: 1,
          visibility: 'visible',
        })
      }
    }
  }
  loadBestScore() {
    const savedData = localStorage.getItem('snakeBestScore')
    if (!savedData) return 0
    try {
      const simpleScore = parseInt(savedData)
      if (!isNaN(simpleScore)) {
        this.saveBestScore(simpleScore)
        return simpleScore
      }
      const { score, timestamp } = JSON.parse(savedData)
      const now = Date.now()
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60)
      if (hoursDiff > 24) {
        localStorage.removeItem('snakeBestScore')
        return 0
      }
      return score
    } catch (e) {
      localStorage.removeItem('snakeBestScore')
      return 0
    }
  }
  saveBestScore(score) {
    const scoreData = {
      score: score,
      timestamp: Date.now(),
    }
    localStorage.setItem('snakeBestScore', JSON.stringify(scoreData))
  }
  isMobileOrTablet() {
    return window.innerWidth < 992
  }
  cleanup() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.mobileControls) {
      this.mobileControls.forEach((button) => {
        button.removeEventListener('click', () =>
          this.handleMobileControl(button)
        )
      })
    }
    window.removeEventListener('resize', () => this.resizeCanvas())
    const scoreDisplay = this.container.querySelector('.score-display')
    if (scoreDisplay && scoreDisplay.parentNode) {
      scoreDisplay.remove()
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  preloadGameAssets()
  hideControls()
})
window.addEventListener('resize', hideControls)
export function initGame() {
  return SnakeGame.initialize()
}
