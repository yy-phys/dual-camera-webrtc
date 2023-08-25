import { connect } from './ayame.js'
import { makeCanvasStream, stopCanvasStream } from './dual-camera.js'
import { sendPosition, stopWatchingPosition } from './location.js'

const connectButton = document.querySelector('button#connect')
const disconnectButton = document.querySelector('button#disconnect')

const localVideo = document.querySelector('#local-video')
const remoteVideo = document.querySelector('#remote-video')
let localStream
let remoteStream

let conn
let dataChannel = null

const reset = () => {
  dataChannel = null

  stopStream(localStream)
  stopStream(remoteStream)
  stopStream(window.stream)
  localStream = null
  remoteStream = null
  window.stream = null

  connectButton.disabled = false
  disconnectButton.disabled = true
}

const stopStream = stream => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

disconnectButton.addEventListener('click', () => {
  if (conn) {
    conn.disconnect()
  }
})

connectButton.addEventListener('click', async () => {
  connectButton.disabled = true
  disconnectButton.disabled = false

  localStream = await makeLocalStream()
  localVideo.srcObject = localStream

  conn = connect()

  conn.on('open', async ({}) => {
    dataChannel = await conn.createDataChannel('dataChannel')
    if (dataChannel) {
      sendPosition(dataChannel)
    }
  })

  conn.on('datachannel', channel => {
    if (!dataChannel) {
      dataChannel = channel
      sendPosition(dataChannel)
    }
  })

  conn.on('addstream', e => {
    remoteStream = e.stream
    remoteVideo.srcObject = remoteStream
    window.stream = e.stream
  })

  conn.on('disconnect', e => {
    stopCanvasStream()
    reset()
    stopWatchingPosition()
  })

  await conn.connect(localStream, null)
})

const makeLocalStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })
  const canvasStream = makeCanvasStream()
  canvasStream.getTracks().forEach(track => {
    stream.addTrack(track)
  })
  return stream
}
