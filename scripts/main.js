$(document).ready(function() {
  attachListeners()
  setColorPicker()
  backgroundLum = getLum(hexToRgb("#F9F9F9"))
  foregroundLum = getLum(hexToRgb("#030303"))
})

function attachListeners() {
  $('#foreground-input').on('input', function() {
    handleForegroundTyping()
  })
  $('#background-input').on('input', function() {
    handleBackgroundTyping()
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

function setColorPicker() {
  document.getElementById("foreground-color-picker").value = rgbToHex($('h1').css('color'))
  document.getElementById("background-color-picker").value = rgbToHex($('body').css('background-color'))
}


// Foreground currently handles typing color words, hex, or rbg, but clumbsily.
// Background does not, because I don't want to repeat my sloppy foreground code.
// Also, I think the 'handleTyping' methods as well as the 'handlePicker' methods
// will probably end up being consolidated, (I.E. instead of having 2 for back and
// 2 for front, just have 2 total that each respond to whichever event called it.)



// Foreground stuff

function handleForegroundTyping() {
  var color = $('#foreground-input').val()
  $('body, h1, h2, h3').css({"color": color})
  setColorPicker()

  // TODO: The function below needs to get changed at some point. Going from jQuery interpreted
  // CSS through the rgbToHex then AGAIN back to a different form of RGB just
  // so that it works with the previously defined function is stupid. Gotta take care of this.

  foregroundLum = getLum(hexToRgb(rgbToHex($('h1').css('color'))))
  setRatio()
}

function handleForegroundPicker(event) {
  var foregroundValue = event.currentTarget.value
  foregroundLum = getLum(hexToRgb(foregroundValue))
  $('body, h1, h2, h3').css({"color": foregroundValue})
  document.getElementById('foreground-input').value = foregroundValue.substr(1)
  setRatio()
}

// Background stuff

function handleBackgroundTyping() {
  var color = $('#background-input').val()
  $('body').css({"background-color": color})
  // setBackgroundColor(color)
  setColorPicker()
}

function handleBackgroundPicker(event) {
  var backgroundValue = event.currentTarget.value
  backgroundLum = getLum(hexToRgb(backgroundValue))
  $('body').css({"background-color": backgroundValue})
  document.getElementById('background-input').value = backgroundValue.substr(1)
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

function highlightHash() {
  alert('hi')
}


function ratioChecker() {
  // There is absolutely a better way to implement the below function,
  // but it's getting late and I can't think of it right now.
  // Tomorrow I will look at that and vomit on myself. Promise.
  if (currentRatio < 3) {
    $("#wcag-aa-large").css({"background-color":"#CF3737"})
    $("#wcag-aa-small").css({"background-color":"#CF3737"})
    $("#wcag-aaa-large").css({"background-color":"#CF3737"})
    $("#wcag-aaa-small").css({"background-color":"#CF3737"})
    document.getElementById("aa-large-pic").setAttribute("src","images/x.svg")
    document.getElementById("aa-small-pic").setAttribute("src","images/x.svg")
    document.getElementById("aaa-large-pic").setAttribute("src","images/x.svg")
    document.getElementById("aaa-small-pic").setAttribute("src","images/x.svg")
  } else if (currentRatio < 4.5) {
    $("#wcag-aa-large").css({"background-color":"#81C70C"})
    $("#wcag-aa-small").css({"background-color":"#CF3737"})
    $("#wcag-aaa-large").css({"background-color":"#CF3737"})
    $("#wcag-aaa-small").css({"background-color":"#CF3737"})
    document.getElementById("aa-large-pic").setAttribute("src","images/check.svg")
    document.getElementById("aa-small-pic").setAttribute("src","images/x.svg")
    document.getElementById("aaa-large-pic").setAttribute("src","images/x.svg")
    document.getElementById("aaa-small-pic").setAttribute("src","images/x.svg")
  } else if (currentRatio < 7.1) {
    $("#wcag-aa-large").css({"background-color":"#81C70C"})
    $("#wcag-aa-small").css({"background-color":"#81C70C"})
    $("#wcag-aaa-large").css({"background-color":"#81C70C"})
    $("#wcag-aaa-small").css({"background-color":"#CF3737"})
    document.getElementById("aa-large-pic").setAttribute("src","images/check.svg")
    document.getElementById("aa-small-pic").setAttribute("src","images/check.svg")
    document.getElementById("aaa-large-pic").setAttribute("src","images/check.svg")
    document.getElementById("aaa-small-pic").setAttribute("src","images/x.svg")
  } else {
    $("#wcag-aa-large").css({"background-color":"#81C70C"})
    $("#wcag-aa-small").css({"background-color":"#81C70C"})
    $("#wcag-aaa-large").css({"background-color":"#81C70C"})
    $("#wcag-aaa-small").css({"background-color":"#81C70C"})
    document.getElementById("aa-large-pic").setAttribute("src","images/check.svg")
    document.getElementById("aa-small-pic").setAttribute("src","images/check.svg")
    document.getElementById("aaa-large-pic").setAttribute("src","images/check.svg")
    document.getElementById("aaa-small-pic").setAttribute("src","images/check.svg")
  }
}

// Formulas and tedius stuff

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
