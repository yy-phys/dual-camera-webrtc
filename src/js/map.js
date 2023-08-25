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

let map
let marker

const _setMarker = () => {
  map.setView([lat, lng], 17)
  marker = L.marker([lat, lng]).addTo(map)
  // marker.bindPopup(`<b style="font-size:24px;">I'm here!</b><br>(${lat}, ${lng})`).openPopup();
}

const _initializePosition = () => {
  map = L.map('map')
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
  _setMarker()
}

const _updatePosition = () => {
  map.removeLayer(marker)
  _setMarker()
}

const onMessage = e => {
  const position = JSON.parse(e.data)
  _setPosition(position)
  if (map) {
    _updatePosition()
  } else {
    _initializePosition()
  }
}

export { onMessage }
