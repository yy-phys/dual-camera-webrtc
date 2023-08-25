const signalingUrl = 'wss://ayame-labo.shiguredo.app/signaling'
let signalingKey = null
let roomId = 'dual-camera-sample'

const parseQueryString = () => {
  const qs = window.Qs
  if (window.location.search.length > 0) {
    var params = qs.parse(window.location.search.substr(1))
    if (params.roomId) {
      roomId = params.roomId
    }
    if (params.signalingKey) {
      signalingKey = params.signalingKey
    }
  }
}

parseQueryString()

const roomIdInput = document.querySelector('#room-input')
roomIdInput.value = roomId
roomIdInput.addEventListener('change', event => {
  roomId = event.target.value
})

const options = Ayame.defaultOptions
if (signalingKey) {
  options.signalingKey = signalingKey
}

const connect = () => {
  return Ayame.connection(signalingUrl, roomId, options, true)
}

export { connect }
