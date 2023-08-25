let lat
let lng

const txt = document.querySelector('#txt')
txt.innerText = 'ここに現在地を表示'
const _displayData = () => {
  txt.innerText = `(緯度, 経度) = (${lat}, ${lng})`
}

const _setPosition = position => {
  lat = position.coords.latitude
  lng = position.coords.longitude
  _displayData()
}

let lastLat
let lastLng

const _sendData = dataChannel => {
  lastLat = lat
  lastLng = lng
  const data = `{"coords":{"latitude":${lat},"longitude":${lng}}}`
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(data)
  }
}

const error = err => {
  console.warn(`ERROR(${err.code}): ${err.message}`)
}

const initialOoptions = {
  enableHighAccuracy: true // trueにすると高精度だが電力消費増加するので最初だけ使う
}

const updateOptions = {
  enableHighAccuracy: false
}

const _initializePosition = dataChannel => {
  navigator.geolocation.getCurrentPosition(
    position => {
      _setPosition(position)
      _sendData(dataChannel)
    },
    error,
    initialOoptions
  )
}

// Ref) https://www.wingfield.gr.jp/archives/9721
// 日本（北緯35度）での緯度、経度の変化をメートルに変換する
const northLatitude35 = {
  latToMeter: 91287.7885,
  lngToMeter: 110940.5844
}
const threshold = 5.0 // （単位はメートル）この距離だけ移動したら現在地更新

let positionId = ''
const _updatePosition = dataChannel => {
  positionId = navigator.geolocation.watchPosition(
    position => {
      _setPosition(position)
      const latDiff = (lat - lastLat) * northLatitude35.latToMeter
      const lngDiff = (lng - lastLng) * northLatitude35.lngToMeter
      const diff = Math.sqrt(latDiff ** 2 + lngDiff ** 2)
      if (diff > threshold) {
        _sendData(dataChannel)
      }
    },
    error,
    updateOptions
  )
}

const sendPosition = dataChannel => {
  _initializePosition(dataChannel)
  _updatePosition(dataChannel)
}

const stopWatchingPosition = () => {
  navigator.geolocation.clearWatch(positionId)
}

export { sendPosition, stopWatchingPosition }
