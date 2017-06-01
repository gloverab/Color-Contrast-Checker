$(document).ready(function() {
  attachListeners()
  setGlobalVars()
  setGlobalColors()
})

function attachListeners() {
  $('.text-color').on('input', function() {
    handleTyping(event)
  })
  $('#foreground-color-picker').on('input', function() {
    handleForegroundPicker(event)
  })
  $('#background-color-picker').on('input', function() {
    handleBackgroundPicker(event)
  })
  $('.text-color').focus(function() {
    focusField(event)
  })
  $('input').blur(function(event) {
    blurInput(event)
  })
  $('#ratio-to-change').change(function() {
    ratioChecker()
  })
}

function setGlobalVars() {
  backgroundLum = getLum(hexToRgb("#F9F9F9"))
  foregroundLum = getLum(hexToRgb("#030303"))

  aaLarge = $("#aa-large")
  aaSmall = $("#aa-small")
  aaaLarge = $("#aaa-large")
  aaaSmall = $("#aaa-small")

  aaLargeIcon = document.getElementById("aa-large-icon")
  aaSmallIcon = document.getElementById("aa-small-icon")
  aaaLargeIcon = document.getElementById("aaa-large-icon")
  aaaSmallIcon = document.getElementById("aaa-small-icon")
}

function setGlobalColors() {
  foregroundColor = document.getElementById("foreground-color-picker").value = rgbToHex($('h1').css('color'))
  backgroundColor = document.getElementById("background-color-picker").value = rgbToHex($('body').css('background-color'))
  foregroundLum = getLum(hexToRgb(foregroundColor))
  backgroundLum = getLum(hexToRgb(backgroundColor))
}

// I think the 'handleTyping' functions as well as the 'handlePicker' functions
// will probably end up being consolidated, (I.E. instead of having 2 for back and
// 2 for front, just have 2 total that each respond to whichever event called it.)

// Typing hex or color in to either

function handleTyping(event) {
  var targetId = event.target.id.substr(0,10)
  targetId === 'foreground' ?
  $('body, h1, h2, h3').css({"color": $('#foreground-input').val()}) :
  $('body').css({"background-color": $('#background-input').val()})

  setGlobalColors()
  setRatio()
}

// Foreground ColorWheel/Picker

function handleForegroundPicker(event) {
  foregroundColor = event.currentTarget.value
  foregroundLum = getLum(hexToRgb(foregroundColor))
  $('body, h1, h2, h3').css({"color": foregroundColor})
  document.getElementById('foreground-input').value = foregroundColor.substr(1)
  setRatio()
}

// Background ColorWheel/Picker

function handleBackgroundPicker(event) {
  backgroundColor = event.currentTarget.value
  backgroundLum = getLum(hexToRgb(backgroundColor))
  $('body').css({"background-color": backgroundColor})
  document.getElementById('background-input').value = backgroundColor.substr(1)
  setRatio()
}

// Focus states

function focusField(event) {
  event.currentTarget.parentElement.style.cssText = "border-color: #15B7FF"
  event.currentTarget.parentElement.firstElementChild.style = "color : #15B7FF"
}

function blurInput(event) {
  event.currentTarget.parentElement.style.cssText = ''
  event.currentTarget.parentElement.firstElementChild.style.cssText = ''
}


// Formulas, algorithms, and the things that make the app work
// outside of just being colorful

function ratioChecker() {
  // There is absolutely a better way to implement the below function,
  // but it's getting late and I can't think of it right now.

  if (currentRatio < 3) {
    aaLarge.css({"background-color":"#CF3737"})
    aaSmall.css({"background-color":"#CF3737"})
    aaaLarge.css({"background-color":"#CF3737"})
    aaaSmall.css({"background-color":"#CF3737"})
    aaLargeIcon.setAttribute("src","images/x.svg")
    aaSmallIcon.setAttribute("src","images/x.svg")
    aaaLargeIcon.setAttribute("src","images/x.svg")
    aaaSmallIcon.setAttribute("src","images/x.svg")
  } else if (currentRatio < 4.5) {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#CF3737"})
    aaaLarge.css({"background-color":"#CF3737"})
    aaaSmall.css({"background-color":"#CF3737"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/x.svg")
    aaaLargeIcon.setAttribute("src","images/x.svg")
    aaaSmallIcon.setAttribute("src","images/x.svg")
  } else if (currentRatio < 7.1) {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#81C70C"})
    aaaLarge.css({"background-color":"#81C70C"})
    aaaSmall.css({"background-color":"#CF3737"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/check.svg")
    aaaLargeIcon.setAttribute("src","images/check.svg")
    aaaSmallIcon.setAttribute("src","images/x.svg")
  } else {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#81C70C"})
    aaaLarge.css({"background-color":"#81C70C"})
    aaaSmall.css({"background-color":"#81C70C"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/check.svg")
    aaaLargeIcon.setAttribute("src","images/check.svg")
    aaaSmallIcon.setAttribute("src","images/check.svg")
  }
}

function setRatio() {
  var higherLum = Math.max(foregroundLum, backgroundLum)
  var lowerLum = Math.min(foregroundLum, backgroundLum)

  currentRatio = parseFloat(((higherLum+.05)/(lowerLum+.05)).toFixed(2))

  $('#ratio-to-change').html(((higherLum+.05)/(lowerLum+.05)).toFixed(2))
  ratioChecker()
}

function getLum(rgbColor) {
  var a = [rgbColor.r,rgbColor.g,rgbColor.b].map(function(v) {
      v /= 255
      return (v <= 0.03928) ?
          v / 12.92 :
          Math.pow( ((v+0.055)/1.055), 2.4 );
      });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function rgbToHex(rgb) {
    var total = rgb.toString().split(',');
    var r = total[0].substring(4);
    var g = total[1].substring(1);
    var b = total[2].substring(1,total[2].length-1);
    return ("#"+checkNumber((r*1).toString(16))+checkNumber((g*1).toString(16))+checkNumber((b*1).toString(16))).toUpperCase();
}

function checkNumber(i){
    i = i.toString();
    if (i.length == 1) return '0'+i;
    else return i;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}



// Graveyard
// Phased out functions that have been replaced or refactored.
// Keeping them around just in case!

// $('#foreground-input').on('input', function() {
//   handleForegroundTyping()
// })
// $('#background-input').on('input', function() {
//   handleBackgroundTyping()
// })

// function handleBackgroundTyping() {
//   $('body').css({"background-color": $('#background-input').val()})
//   setGlobalColors()
//   backgroundLum = getLum(hexToRgb(backgroundColor))
//   setRatio()
// }

// function handleForegroundTyping() {
//   $('body, h1, h2, h3').css({"color": $('#foreground-input').val()})
//   setGlobalColors()
//   foregroundLum = getLum(hexToRgb(foregroundColor))
//   setRatio()
// }
