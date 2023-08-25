import { connect } from './ayame.js'
import { initRecording, disableRecordButton } from './recorder.js'
import { onMessage } from './map.js'

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
      dataChannel.onmessage = onMessage
    }
  })

  conn.on('datachannel', channel => {
    if (!dataChannel) {
      dataChannel = channel
      dataChannel.onmessage = onMessage
    }
  })

  conn.on('addstream', e => {
    remoteStream = e.stream
    remoteVideo.srcObject = remoteStream
    window.stream = e.stream
    initRecording()
  })

  conn.on('disconnect', e => {
    reset()
    disableRecordButton()
  })

  await conn.connect(localStream, null)
})

const makeLocalStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
  return stream
}
