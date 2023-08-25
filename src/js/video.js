const handleError = err => {
  console.warn(`ERROR(${err.code}): ${err.message}`)
}

const makeVideoSelectors = numCameras => {
  const videoSelectors = []
  const selectorsFragment = document.createDocumentFragment()
  for (let i = 0; i < numCameras; ++i) {
    const select = document.createElement('select')
    _addSelect(selectorsFragment, select, i)
    videoSelectors.push(select)

    const br = document.createElement('br')
    selectorsFragment.appendChild(br)
  }
  document.querySelector('#video-selectors').appendChild(selectorsFragment)
  return videoSelectors
}

const _addSelect = (fragment, select, idx) => {
  const id = `select${idx}`
  select.setAttribute('id', id)
  const label = document.createElement('label')
  label.htmlFor = id
  label.appendChild(document.createTextNode(`カメラ ${idx + 1}:`))
  fragment.appendChild(label)
  fragment.appendChild(select)
}

const makeVideoElements = numCameras => {
  const videoElements = []
  for (let i = 0; i < numCameras; ++i) {
    videoElements.push(document.createElement('video'))
  }
  return videoElements
}

const runVideoStreams = (videoElements, videoSelectors) => {
  videoElements.forEach((videoElement, idx) => {
    const selectedValues = ['']
    for (let i = 0; i < idx; i++) {
      selectedValues.push(videoSelectors[i].value)
    }

    if (selectedValues.includes(videoSelectors[idx].value)) {
      // don't show same videos
    } else {
      _playVideoStream(videoElement, videoSelectors[idx])
    }
  })
}

const _playVideoStream = (videoElement, videoSelect) => {
  navigator.mediaDevices
    .getUserMedia(_makeVideoConstraints(videoSelect))
    .then(stream => {
      videoElement.srcObject = stream
      videoElement.play()
    })
    .catch(handleError)
}

const _makeVideoConstraints = videoSelect => {
  const videoSource = videoSelect.value
  const constraints = {
    audio: false,
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined
    }
  }
  return constraints
}

const stopVideoStream = videoElement => {
  if (videoElement.srcObject) {
    _stopStream(videoElement.srcObject)
    videoElement.srcObject = null
  }
}

const _stopStream = stream => {
  stream.getTracks().forEach(track => track.stop())
}

export {
  makeVideoSelectors,
  makeVideoElements,
  runVideoStreams,
  stopVideoStream
}
