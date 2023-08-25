const handleError = err => {
  console.warn(`ERROR(${err.code}): ${err.message}`)
}

const initSelectors = videoSelectors => {
  navigator.permissions.query({ name: 'camera' }).then(result => {
    if (result.state !== 'granted') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop())
        })
        .then(() => _setAllMediaDevices(videoSelectors))
        .catch(handleError)
    } else {
      _setAllMediaDevices(videoSelectors)
    }
  })
}

const _setAllMediaDevices = videoSelectors => {
  navigator.mediaDevices
    .enumerateDevices()
    .then(deviceInfos => {
      _setMediaDevices(deviceInfos, videoSelectors, 'videoinput')
    })
    .catch(handleError)
}

const _setMediaDevices = (deviceInfos, selectors, kind) => {
  const selectedValues = selectors.map(select => select.value)
  _resetSelectors(selectors)
  _setSelectorLists(deviceInfos, selectors, kind)
  _setSelectedValues(selectors, selectedValues)
}

const _resetSelectors = selectors => {
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild)
    }
  })
}

const _setSelectorLists = (deviceInfos, selectors, kind) => {
  deviceInfos.forEach(deviceInfo => {
    if (deviceInfo.kind === kind) {
      selectors.forEach(select => _appendOption(deviceInfo, select))
    }
  })
}

const _appendOption = (deviceInfo, select) => {
  const option = document.createElement('option')
  option.value = deviceInfo.deviceId
  option.text = deviceInfo.label || `device ${select.length + 1}`
  select.appendChild(option)
}

const _setSelectedValues = (selectors, selectedValues) => {
  selectors.forEach((select, idx) => {
    if (
      Array.prototype.slice
        .call(select.childNodes)
        .some(n => n.value === selectedValues[idx])
    ) {
      select.value = selectedValues[idx]
    } else {
      select.selectedIndex = idx
      // if (idx < select.length) {
      //     select.selectedIndex = idx;
      // } else {
      //     select.selectedIndex = 0;
      // }
    }
  })
}

export { initSelectors }
