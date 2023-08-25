const recordStartButton = document.querySelector('button#record-start')
const recordStopButton = document.querySelector('button#record-stop')
const downloadButton = document.querySelector('button#download')
const codecSelector = document.querySelector('#codecs')

// Ref) https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/record/js/main.js

let recordedBlobs
let mediaRecorder

const _enableRecordButton = () => {
  recordStartButton.disabled = false
  recordStopButton.disabled = true
  downloadButton.disabled = true
  codecSelector.disabled = false
}

const disableRecordButton = () => {
  recordStartButton.disabled = true
  recordStopButton.disabled = true
  downloadButton.disabled = true
  codecSelector.disabled = true
}

recordStartButton.addEventListener('click', () => {
  recordStartButton.disabled = true
  recordStopButton.disabled = false
  downloadButton.disabled = true
  codecSelector.disabled = true
  _startRecording()
})

recordStopButton.addEventListener('click', () => {
  recordStartButton.disabled = false
  recordStopButton.disabled = true
  downloadButton.disabled = false
  codecSelector.disabled = false
  _stopRecording()
})

downloadButton.addEventListener('click', () => {
  _downloadVideo()
})

const _startRecording = () => {
  recordedBlobs = []
  const codec = _getCodec()
  const options = { codec }

  try {
    mediaRecorder = new MediaRecorder(window.stream, options)
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e)
    return
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options)

  mediaRecorder.onstop = event => {
    console.log('Recorder stopped: ', event)
    console.log('Recorded Blobs: ', recordedBlobs)
  }

  mediaRecorder.ondataavailable = event => {
    console.log('handleDataAvailable', event)
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data)
    }
  }

  mediaRecorder.start()
  console.log('MediaRecorder started', mediaRecorder)
}

const _stopRecording = () => {
  mediaRecorder.stop()
}

const _downloadVideo = () => {
  const mimeType = _getMimeType()
  const blob = new Blob(recordedBlobs, { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = 'video.' + mimeType.split('/')[1]
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

const _getCodec = () => {
  return codecSelector.options[codecSelector.selectedIndex].value
}

const _getMimeType = () => {
  return _getCodec().split(';', 1)[0]
}

const _setCodecSlector = () => {
  while (codecSelector.firstChild) {
    codecSelector.removeChild(codecSelector.firstChild)
  }

  _getSupportedCodecs().forEach(mimeType => {
    const option = document.createElement('option')
    option.value = mimeType
    option.innerText = option.value
    codecSelector.appendChild(option)
  })
}

function _getSupportedCodecs () {
  const possibleTypes = [
    'video/webm;codecs=av1,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac'
  ]
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType)
  })
}

const initRecording = () => {
  _setCodecSlector()
  _enableRecordButton()
}

export { initRecording, disableRecordButton }
