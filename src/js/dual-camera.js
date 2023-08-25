import {
  makeVideoSelectors,
  makeVideoElements,
  runVideoStreams,
  stopVideoStream
} from './video.js'
import { initSelectors } from './selector.js'

const numCameras = 2
const videoSelectors = makeVideoSelectors(numCameras)
const videoElements = makeVideoElements(numCameras)

initSelectors(videoSelectors)

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })
const frameRate = 30 // TODO: 適切な値に設定
const zoomRate = 0.5 // TODO: 適切な値に設定
let videoWidth = 0
let videoHeight = 0
let cwidth = 0
let cheight = 0
let horizontal = true
const setCanvasSize = videoElements => {
  if (
    (videoElements[0].videoWidth !== 0) &
    (videoElements[0].videoWidth !== videoWidth)
  ) {
    videoWidth = videoElements[0].videoWidth
    videoHeight = videoElements[0].videoHeight
    const videoNum = videoElements[1].srcObject ? 2 : 1
    // _setAdaptive()
    canvas.width = videoWidth * zoomRate * videoNum
    canvas.height = videoHeight * zoomRate
    cwidth = canvas.width / videoNum
    cheight = canvas.height
    console.log(`${canvas.width}-${canvas.height}`)
  }
}

const _setAdaptive = () => {
  if (videoWidth < videoHeight) {
    canvas.width = videoWidth * zoomRate * videoNum
    canvas.height = videoHeight * zoomRate
    cwidth = canvas.width / videoNum
    cheight = canvas.height
    horizontal = true
  } else {
    canvas.width = videoWidth * zoomRate
    canvas.height = videoHeight * zoomRate * videoNum
    cwidth = canvas.width
    cheight = canvas.height / videoNum
    horizontal = false
  }
}

const drawCanvas = videoElements => {
  ctx.drawImage(videoElements[0], 0, 0, cwidth, cheight)
  if (videoElements[1].srcObject) {
    if (horizontal) {
      ctx.drawImage(videoElements[1], cwidth, 0, cwidth, cheight)
    } else {
      ctx.drawImage(videoElements[1], 0, cheight, cwidth, cheight)
    }
  }
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

let canvasId = ''
const loop = () => {
  setCanvasSize(videoElements)
  drawCanvas(videoElements)
  canvasId = window.requestAnimationFrame(loop)
}

const makeCanvasStream = () => {
  const canvasStream = canvas.captureStream(frameRate)
  runVideoStreams(videoElements, videoSelectors)
  clearCanvas()
  loop()
  return canvasStream
}

const stopCanvasStream = () => {
  videoElements.forEach(stopVideoStream)
  if (canvasId !== '') {
    window.cancelAnimationFrame(canvasId)
  }
}

export { makeCanvasStream, stopCanvasStream }
