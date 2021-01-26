var ic = document.querySelector('#ImageContainer')
var icImg = document.querySelector('#img-box')
var baseX = 0, baseY = 0
var baseScale = 1
var oldMouseX, oleMouseY, boxX = 0, boxY = 0
ic.onmousewheel = function (e) {
  e.preventDefault()
  if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
    if (e.wheelDelta > 0) { //当滑轮向上滚动时
      if (e.ctrlKey) {
        baseScale -= e.deltaY * 0.001
      } else {
        baseY -= e.deltaY
      }
      icImg.style.transform = `scale(${baseScale}, ${baseScale}) translate(${baseX}, ${baseY}px)`
      icImg.style.transformOrigin = `${e.clientX - boxY}px ${e.clientY - boxX}px`
    }
    if (e.wheelDelta < 0) { //当滑轮向下滚动时
      if (e.ctrlKey) {
        if ((baseScale - e.deltaY * 0.001) > 0.1) {
          baseScale -= e.deltaY * 0.001
        } else {
          baseScale = 0.1
        }
      } else {
        baseY -= e.deltaY
      }
      icImg.style.transform = `scale(${baseScale}, ${baseScale}) translate(0, ${baseY}px)`
      icImg.style.transformOrigin = `${e.clientX - boxY}px ${e.clientY - boxX}px`
    }
  } else if (e.detail) {  //Firefox滑轮事件
    if (e.detail> 0) { //当滑轮向上滚动时
      console.log("滑轮向上滚动");
    }
    if (e.detail< 0) { //当滑轮向下滚动时
      console.log("滑轮向下滚动");
    }
  }
}
ic.onmousedown = function (e) {
  if (e.button == 0) {
    oldMouseX = e.clientX
    oleMouseY = e.clientY
    ic.onmousemove = tomove
  } else if (e.button == 1) {
  } else if (e.button == 2) {
  }
}
ic.onmouseup = function () {
  ic.onmousemove = null
}
function tomove (e) {
  // console.log(e)
  let offsetX = e.clientX - oldMouseX
  let offsetY = e.clientY - oleMouseY
  oldMouseX = e.clientX
  oleMouseY = e.clientY
  boxX += offsetY
  boxY += offsetX
  $('#img-box').css('top', boxX + 'px')
  $('#img-box').css('left', boxY + 'px')
}
document.oncontextmenu = function(e){ e.preventDefault(); 
  $('.global-context-list').css('top', e.clientY)
  $('.global-context-list').css('left', e.clientX)
  $('.global-context-list').show()
};
document.body.onclick = function () {
  $('.global-context-list').hide()
}

var PSD = require('psd');
let filterLayers = []
var selectedLayer = null

PSD.fromURL("./test1.psd").then(function(psd) {
  document.getElementById('img-box').style.height = psd.image.height() * 0.5 + 'px'
  document.getElementById('img-box').style.width = psd.image.width() * 0.5 + 'px'
  console.log(psd.tree())
  // console.log(psd.tree().export())
  psd.layers.forEach(layer => {
    if (layer.width != 0 && layer.height != 0 && layer.visible) {
      filterLayers.push(layer)
    }
  });
  console.log(filterLayers)
  filterLayers.reverse()
  filterLayers.forEach((layer, idx) => {
    let l = document.createElement('div')
    l.style.width = layer.width * 0.5 + 'px'
    l.style.height = layer.height * 0.5 + 'px'
    l.classList.add('layer')
    if (idx == 0) {
      l.classList.add('wrapper-layer')
    }
    l.style.left = layer.left * 0.5 + 'px'
    l.style.top = layer.top * 0.5 + 'px'
    l.dataset.top = layer.top * 0.5
    l.dataset.right = layer.left * 0.5 + layer.width * 0.5
    l.dataset.bottom = layer.top * 0.5 + layer.height * 0.5
    l.dataset.left = layer.left * 0.5
    l.dataset.width = layer.width * 0.5
    l.dataset.height = layer.height * 0.5
    l.dataset.layername = layer.name
    l.layer = layer
    let textInfo = layer.node.export().text
    if (textInfo) {
      l.textInfo = textInfo
    }
    document.getElementById('img-box').appendChild(l)
  })
  // document.getElementById('img-box').style.background = 'url(' + psd.image.toBase64() + ')';
  document.getElementById('img-box').appendChild(psd.image.toPng());
  let layers = document.querySelectorAll('#img-box .layer')
  layers.forEach((l, idx) => {
    l.addEventListener('click', function (e) {
      e.stopPropagation()
      layers.forEach(i => {
        if (i == l) {
          l.classList.toggle('selected')
        } else {
          i.classList.remove('selected')
        }
      })
      if (l.classList.contains('selected')) {
        selectedLayer = l
        if (!l.layerImg) {
          let img = l.layer.image.toPng()
          l.layerImg = img
        }
        $('.right-board .img-board').html('')
        $('.right-board .img-board').append(l.layerImg)
        document.querySelector('.download-btn').href = l.layerImg.src
        document.querySelector('.download-btn').download = l.dataset.layername
        if (l.textInfo) {
          $('.right-board .value').html(l.textInfo.value)
          $('.right-board .name').html(l.textInfo.font.name)
          $('.right-board .alignment').html(l.textInfo.font.alignment)
          $('.right-board .color').html(l.textInfo.font.colors[1].join(','))
          $('.right-board .size').html(l.textInfo.font.sizes[0])
          $('.right-board .font-board').show()
        } else {
          $('.right-board .font-board').hide()
        }
        $('.right-board').css('right', '0px')
      } else {
        selectedLayer = null
        $('.right-board').css('right', '-260px')
      }
    })
    l.onmouseover = function (e) {
      if (!selectedLayer) {
        $('.global-top-line').css('top', l.dataset.top + 'px')
        $('.global-right-line').css('left', l.dataset.right + 'px')
        $('.global-bottom-line').css('top', l.dataset.bottom + 'px')
        $('.global-left-line').css('left', l.dataset.left + 'px')
        $('.global-line').show()
      } else {
        calLocation(selectedLayer, l)
      }
    }
    l.onmouseout = function () {
      $('.global-line').hide()
    }
  })
  function calLocation (s, l) {  // s selected l now hover
    if (s == l) {
      return
    }
    let bigger, smaller
    if (s.dataset.width * s.dataset.height > l.dataset.width * l.dataset.height) {
      bigger = s
      smaller = l
    } else {
      bigger = l
      smaller = s
    }
    if (bigger.dataset.left < smaller.dataset.left &&
        bigger.dataset.right > smaller.dataset.right && 
        bigger.dataset.top < smaller.dataset.top && 
        bigger.dataset.bottom > smaller.dataset.bottom) { // 包含
      positionDis1 (bigger, smaller)
    }
    $('.global-dis').show()
  }
  function positionDis1 (bigger, smaller) {
    let topDis = smaller.dataset.top - bigger.dataset.top
    let rightDis = bigger.dataset.right - smaller.dataset.right
    let bottomDis = bigger.dataset.bottom - smaller.dataset.bottom
    let leftDis = smaller.dataset.left - bigger.dataset.left

    $('.global-top-dis').attr('data-dis', topDis)
    $('.global-right-dis').attr('data-dis', rightDis)
    $('.global-bottom-dis').attr('data-dis', bottomDis)
    $('.global-left-dis').attr('data-dis', Math.abs(leftDis))

    $('.global-top-dis').css('height', topDis + 'px')
    $('.global-right-dis').css('width', rightDis + 'px')
    $('.global-bottom-dis').css('height', bottomDis + 'px')
    $('.global-left-dis').css('width', leftDis + 'px')

    $('.global-top-dis').css('top', bigger.dataset.top + 'px')
    $('.global-top-dis').css('left', parseInt(smaller.dataset.left) + parseInt(smaller.dataset.width * 0.2) + 'px')

    $('.global-right-dis').css('top', (parseInt(smaller.dataset.top) + parseInt(smaller.dataset.height * 0.2)) + 'px')
    $('.global-right-dis').css('left', smaller.dataset.right + 'px')

    $('.global-bottom-dis').css('top', smaller.dataset.bottom + 'px')
    $('.global-bottom-dis').css('left', (parseInt(smaller.dataset.right) - parseInt(smaller.dataset.width * 0.2)) + 'px')

    $('.global-left-dis').css('top', (parseInt(smaller.dataset.bottom) - parseInt(smaller.dataset.height * 0.2)) + 'px')
    $('.global-left-dis').css('left', bigger.dataset.left + 'px')
  }
});
