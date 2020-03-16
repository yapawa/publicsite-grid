/* global PhotoSwipe, PhotoSwipeUI_Default, fetch, createImageBitmap, XMLHttpRequest */
function initPhotoSwipefromDOM (gallerySelector, photoList) {
  var closest = function closest (el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn))
  }

  const onThumbnailsClick = function (e) {
    e = e || window.event
    e.preventDefault ? e.preventDefault() : e.returnValue = false

    const eTarget = e.target || e.srcElement

    var clickedListItem = closest(eTarget, function (el) {
      return (el.getAttribute('data-pswp-uid'))
    })

    if (!clickedListItem) {
      return
    }
    const index = clickedListItem.getAttribute('data-pswp-uid') - 1
    openPhotoSwipe(index, photoList, galleryElements, false, false)
  }

  const galleryElements = document.querySelectorAll(gallerySelector)

  for (let i = 0; i < galleryElements.length; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1)
    galleryElements[i].onclick = onThumbnailsClick
  }

  // Parse URL and open gallery if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash()
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, photoList, galleryElements, true, true)
  }
}

// parse picture index and gallery index from URL (#&pid=1&gid=2)
const photoswipeParseHash = function () {
  const hash = window.location.hash.substring(1)
  const params = {}

  if (hash.length < 5) {
    return params
  }

  const vars = hash.split('&')
  for (let i = 0; i < vars.length; i++) {
    if (!vars[i]) {
      continue
    }
    const pair = vars[i].split('=')
    if (pair.length < 2) {
      continue
    }
    params[pair[0]] = pair[1]
  }

  if (params.gid) {
    params.gid = parseInt(params.gid, 10)
  }

  return params
}

const supportsWebp = async function () {
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
  const res = await fetch(webpData).then(function (r) {
    return r.blob().then(function (blob) {
      return createImageBitmap(blob).then(function () {
        return true
      }, function () {
        return false
      })
    })
  })
  return res
}

const openPhotoSwipe = async function (index, photoList, itemsList, disableAnimation, fromURL) {
  var pswpElement = document.querySelectorAll('.pswp')[0]

  const items = []
  const selected = itemsList[index].querySelector('picture:first-child > img').currentSrc
  let format = null
  if (selected && selected.match(/^https?:\/\//)) {
    format = selected.split('.').pop()
  }
  if (!format) {
    format = await supportsWebp() ? 'webp' : 'jpg'
  }

  for (let i = 0; i < photoList.length; i++) {
    let source = itemsList[i].querySelector('picture:first-child > img').currentSrc
    if (source.match(/^https?:\/\//)) {
      if (!format) {
        format = selected.split('.').pop()
      }
    } else {
      source = null
    }
    const el = photoList[i]
    const date = new Date(el.updatedAt)
    const version = Math.round(date.getTime() / 1000)
    items.push({
      msrc: source || null,
      w: el.width,
      h: el.height,
      title: el.description,
      name: el.name,
      domain: '{{ $.Site.Params.cacheDomain }}',
      key: el.file.key,
      version: version.toString(),
      slug: el.slug,
      format: (format || 'jpg')
    })
  }
  // define options (if needed)
  var options = {
    preload: [2, 5],
    barsSize: { top: 0, bottom: 0 },
    // optionName: 'option value'
    // for example:
    getThumbBoundsFn: function (index) {
      var thumbnail = document.querySelectorAll("[data-pswp-uid='" + (index + 1) + "']")[0]
      const pageYScroll = window.pageYOffset || document.documentElement.scrollTop
      const rect = thumbnail.getBoundingClientRect()
      return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
    },
    index: index, // start at first slide
    shareEl: false,
    zoomEl: false,
    maxSpreadZoom: 1,
    getDoubleTapZoom: function (isMouseclick, item) {
      return item.initalZoomLevel
    },
    pinchToClose: false
  }

  // PhotoSwipe opened from URL
  if (fromURL) {
    if (options.galleryPIDs) {
      // parse real index when custom PIDs are used
      // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
      for (let j = 0; j < items.length; j++) {
        if (items[j].pid === index) {
          options.index = j
          break
        }
      }
    } else {
      // in URL indexes start from 1
      options.index = parseInt(index, 10) - 1
    }
  } else {
    options.index = parseInt(index, 10)
  }

  // exit if index not found
  if (isNaN(options.index)) {
    return
  }

  if (disableAnimation) {
    options.showAnimationDuration = 0
  }

  let firstResize = true
  let imageSrcWillChange = false
  let previousWidth = 0
  let previousHeight = 0
  const sizeStep = 500

  // Initializes and opens PhotoSwipe
  var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options)
  gallery.listen('beforeResize', function () {
    const width = Math.ceil(gallery.viewportSize.x / sizeStep) * sizeStep
    const height = Math.ceil(gallery.viewportSize.y / sizeStep) * sizeStep

    if (previousWidth !== width) {
      previousWidth = width
      imageSrcWillChange = true
    }
    if (previousHeight !== height) {
      previousHeight = height
      imageSrcWillChange = true
    }
    if (imageSrcWillChange && !firstResize) {
      gallery.invalidateCurrItems()
    }
    if (firstResize) {
      firstResize = false
    }
    imageSrcWillChange = false
  })

  gallery.listen('gettingData', function (index, item) {
    const width = Math.ceil(gallery.viewportSize.x / sizeStep) * sizeStep
    const height = Math.ceil(gallery.viewportSize.y / sizeStep) * sizeStep
    const dpr = window.devicePixelRatio
    let transf = 'c_cover,w_' + width + ',h_' + height
    if (dpr > 1) {
      transf = transf + ',dpr_' + dpr
    }
    item.src = 'https://' + item.domain + '/' + item.key + '/' + item.version + '/' + transf + '/' + item.slug + '.' + item.format
  })

  gallery.init()
}

function loadJSON () {
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const data = JSON.parse(this.responseText)
      data.pop()
      initPhotoSwipefromDOM('.photo-grid-item', data)
    }
  }
  xhttp.open('GET', 'index.json', true)
  xhttp.send()
}
loadJSON()
