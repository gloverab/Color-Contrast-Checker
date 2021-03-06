$(document).ready(function() {
  attachListeners()
  setGlobalVars()
  setGlobalColors()
  registerVueComponent()
  handleColorsFromURL()
})

let confettiCount = 0
let lastFulfilled = false

// Registering the Vue component for the color pickers.

// The color picker component is a modified version of code originally written by Florian Schulz.

function registerVueComponent() {

  Vue.component("js-color-picker", {
    template: "#color-picker-template",
    props: ["change", "initial"],
    data: function() {
      return {
        isVisible: false,
        h: 0,
        s: 0,
        l: 1
      }
    },
    computed: {
      color: function() {
        var hsl = hsb2hsl(parseFloat(this.h) / 360, parseFloat(this.s) / 100, parseFloat(this.l) / 100)

        var c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%";

        var s = "hsl(" + c + ")";
        this.change({
          color: s
        });
        return s;
      },
      colorString: function() {
        var c = this.h + ", " + this.s + "%, " + this.l + "%"
        return c;
      },
      gradientH: function() {
        var stops = [];
        for (var i = 0; i < 7; i++) {
          var h = i * 60;

          var hsl = hsb2hsl(parseFloat(h / 360), parseFloat(this.s) / 100, parseFloat(this.l / 100))

          var c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%"
          stops.push("hsl(" + c + ")")
        }

        return {
          backgroundImage: "linear-gradient(to right, " + stops.join(', ') + ")"
        }
      },
      gradientS: function() {
        var stops = [];
        var c;
        var hsl = hsb2hsl(parseFloat(this.h / 360), 0, parseFloat(this.l / 100))
        c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%"
        stops.push("hsl(" + c + ")")

        var hsl = hsb2hsl(parseFloat(this.h / 360), 1, parseFloat(this.l / 100))
        c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%"
        stops.push("hsl(" + c + ")")

        return {
          backgroundImage: "linear-gradient(to right, " + stops.join(', ') + ")"
        }
      },

      gradientL: function() {
        var stops = [];
        var c;

        var hsl = hsb2hsl(parseFloat(this.h / 360), 0, 0)
        c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%"
        stops.push("hsl(" + c + ")")

        var hsl = hsb2hsl(parseFloat(this.h / 360), parseFloat(this.s / 100), 1)

        c = hsl.h + ", " + hsl.s + "%, " + hsl.l + "%"
        stops.push("hsl(" + c + ")")

        return {
          backgroundImage: "linear-gradient(to right, " + stops.join(', ') + ")"

        }
      }
    },
    methods: {
      show: function() {
        this.isVisible = true;
      },
      hide: function() {
        this.isVisible = false;
      },
      toggle: function() {
        this.isVisible = !this.isVisible;
      }
    },
  })

  //Foreground color picker component

  vueForeground = new Vue({
    el: "#js-foreground-color-picker",
    data: function () {
      return {
        color: ''
      }
    },
    methods: {
      updateColor: function(event) {
        this.color = event.color;
        if ($(".color-chip").length != 0) {
          handleForegroundPicker(event)
        }
      },

      //Foreground color picker methods.

      updateColorFromType: function() {
        rgbForeground = hexToRgb(foregroundColor)

        let r = rgbForeground.r
        let g = rgbForeground.g
        let b = rgbForeground.b

        hslForeground = rgbToHsv(r,g,b)

        this.$children[0].$vnode.elm.__vue__.h = hslForeground[0]
        this.$children[0].$vnode.elm.__vue__.s = hslForeground[1]*100
        this.$children[0].$vnode.elm.__vue__.l = hslForeground[2]*100

      }
    }
  })

  //Background color picker component

  vueBackground = new Vue({
    el: "#js-background-color-picker",
    data: function () {
      return {
        color: ''
      }
    },
    methods: {

      //Background color picker methods. Eventually would like to dry this up with ONE method on the parent component for both the foreground & background pickers.

      updateColor: function(event) {
        this.color = event.color;
        if ($(".color-chip").length != 0) {
          handleBackgroundPicker(event)
        }
      },
      updateColorFromType: function() {
        rgbBackground = hexToRgb(backgroundColor)

        let r = rgbBackground.r
        let g = rgbBackground.g
        let b = rgbBackground.b

        hslBackground = rgbToHsv(r,g,b)

        this.$children[0].$vnode.elm.__vue__.h = hslBackground[0]
        this.$children[0].$vnode.elm.__vue__.s = hslBackground[1]*100
        this.$children[0].$vnode.elm.__vue__.l = hslBackground[2]*100

      }
    }
  })

  function hsb2hsl(h, s, b) {
    var hsl = {
      h: h
    };
    hsl.l = (2 - s) * b;
    hsl.s = s * b;

    if (hsl.l <= 1 && hsl.l > 0) {
      hsl.s /= hsl.l;
    } else {
      hsl.s /= 2 - hsl.l;
    }

    hsl.l /= 2;

    if (hsl.s > 1) {
      hsl.s = 1;
    }

    if (!hsl.s > 0) hsl.s = 0


    hsl.h *= 360;
    hsl.s *= 100;
    hsl.l *= 100;

    return hsl;
  }
}

function attachListeners() {
  $('.text-color').on('input', function(event) {
    handleTyping(event)
  })
  $('#foreground-color-picker').on('input', function(event) {
    handleForegroundPicker(event)
  })
  $('#background-color-picker').on('input', function(event) {
    handleBackgroundPicker(event)
  })
  $('.text-color').focus(function(event) {
    focusField(event)
  })
  $('input').blur(function(event) {
    blurInput(event)
  })
  $('#ratio-to-change').change(function() {
    ratioChecker()
  })
  $('#make-it-work').on('click', function(event) {
    makeItWork(event)
  })
}

function setGlobalVars() {
  backgroundLum = getLum(hexToRgb("#ff0000"))
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

// THIS ONE WORKS WITH THE OLD VERSION / HTML5 COLOR PICKER

// function setGlobalColors() {
//   foregroundColor = document.getElementById("foreground-color-picker").value = rgbToHex($('h1').css('color'))
//   backgroundColor = document.getElementById("background-color-picker").value = rgbToHex($('body').css('background-color'))
//   foregroundLum = getLum(hexToRgb(foregroundColor))
//   backgroundLum = getLum(hexToRgb(backgroundColor))
// }

function getThemedColors() {
  const monthNum = new Date().getMonth()
  switch(monthNum) {
    case 9:
      foregroundColor = "#ff7033"
      backgroundColor = "#030303"
      $('#site-credits').append(' 🎃')
      break;
    case 11:
      foregroundColor = "#b00000"
      backgroundColor = "#ffffff"
      $('#site-credits').append(' 🎅')
      break;
    default:
      foregroundColor = "#030303"
      backgroundColor = "#F9F9F9"
  }
}

function handleColorsFromURL() {
  const uri = window.location.href.split("?")[1]
  if (uri) {
    const terms = uri.split("&")
    foregroundColor = terms[0].replace('fc=', '')
    backgroundColor = terms[1].replace('bc=', '')
  } else {
    getThemedColors()
  }
  foregroundLum = getLum(hexToRgb(foregroundColor))
  backgroundLum = getLum(hexToRgb(backgroundColor))

  $('body, h1, h2, h3').css({"color": foregroundColor})
  $('body').css({"background-color": backgroundColor})

  document.getElementById('foreground-input').value = foregroundColor.substr(1)
  document.getElementById('background-input').value = backgroundColor.substr(1)
  foregroundType()
  backgroundType()
  setRatio()
}


function setGlobalColors() {
  foregroundColor = rgbToHex($('h1').css('color'))
  backgroundColor = rgbToHex($('body').css('background-color'))
}

// Typing hex or color in to either

function handleTyping(event) {
  var targetId = event.target.id.substr(0,10)
  if (targetId === 'foreground') {
    foregroundType()
  } else {
    backgroundType()
  }
  updateUrl()
  setRatio()
}

function foregroundType() {
  $('body, h1, h2, h3').css({"color": $('#foreground-input').val()})
  setGlobalColors()
  foregroundLum = getLum(hexToRgb(foregroundColor))
  vueForeground.updateColorFromType()
}

function backgroundType() {
  $('body').css({"background-color": $('#background-input').val()})
  setGlobalColors()
  backgroundLum = getLum(hexToRgb(backgroundColor))
  vueBackground.updateColorFromType()
}

const updateUrl = () => {
  window.history.replaceState(null, null, `?fc=${foregroundColor}&bc=${backgroundColor}`)
}

// Foreground ColorWheel/Picker

function handleForegroundPicker(event) {
  foregroundColor = hslToHex(event)
  foregroundLum = getLum(hexToRgb(foregroundColor))

  $('body, h1, h2, h3').css({"color": foregroundColor})

  document.getElementById('foreground-input').value = foregroundColor.substr(1)
  setRatio()
  updateUrl()
}

// Background ColorWheel/Picker

function handleBackgroundPicker(event) {
  backgroundColor = hslToHex(event)
  backgroundLum = getLum(hexToRgb(backgroundColor))

  $('body').css({"background-color": backgroundColor})

  document.getElementById('background-input').value = backgroundColor.substr(1)
  setRatio()
  updateUrl()
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


// Make it work - STILL IN PROGRESS!!!!!

function makeItWork(event) {
  event.preventDefault()
  if (currentRatio >= 7.1) {
    event.target.innerHTML += " - Hey! It already works, silly!"
  } else {
    let foregroundBrightness = parseInt(vueForeground.$children[0].$vnode.elm.__vue__.l)
    let backgroundBrightness = parseInt(vueBackground.$children[0].$vnode.elm.__vue__.l)

    let brighter = Math.max(foregroundBrightness, backgroundBrightness)
    let dimmer = Math.min(foregroundBrightness, backgroundBrightness)

  }
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
    if (lastFulfilled) {
      $(".confetti").remove();
      lastFulfilled = false
    }
  } else if (currentRatio < 4.5) {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#CF3737"})
    aaaLarge.css({"background-color":"#CF3737"})
    aaaSmall.css({"background-color":"#CF3737"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/x.svg")
    aaaLargeIcon.setAttribute("src","images/x.svg")
    aaaSmallIcon.setAttribute("src","images/x.svg")
    if (lastFulfilled) {
      $(".confetti").remove();
      lastFulfilled = false
    }
  } else if (currentRatio < 7.1) {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#81C70C"})
    aaaLarge.css({"background-color":"#81C70C"})
    aaaSmall.css({"background-color":"#CF3737"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/check.svg")
    aaaLargeIcon.setAttribute("src","images/check.svg")
    aaaSmallIcon.setAttribute("src","images/x.svg")
    if (lastFulfilled) {
      $(".confetti").remove();
      lastFulfilled = false
    }
  } else {
    aaLarge.css({"background-color":"#81C70C"})
    aaSmall.css({"background-color":"#81C70C"})
    aaaLarge.css({"background-color":"#81C70C"})
    aaaSmall.css({"background-color":"#81C70C"})
    aaLargeIcon.setAttribute("src","images/check.svg")
    aaSmallIcon.setAttribute("src","images/check.svg")
    aaaLargeIcon.setAttribute("src","images/check.svg")
    aaaSmallIcon.setAttribute("src","images/check.svg")
    if (!lastFulfilled) {
      confetti()
      lastFulfilled = true
    }
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


//RGB to HEX functions

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

// HEX to RGB function

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

// HSL to HEX function

function hslToHex(event) {
  let h = parseInt(event.color.split('(')[1].split(',')[0])
  let s = parseFloat(event.color.split(', ')[1])
  let l = parseFloat(event.color.split(', ')[2].slice(0,-1))

  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// RGB to HSV function

function rgbToHsv (r,g,b) {
 var computedH = 0;
 var computedS = 0;
 var computedV = 0;

 //remove spaces from input RGB values, convert to int
 var r = parseInt( (''+r).replace(/\s/g,''),10 );
 var g = parseInt( (''+g).replace(/\s/g,''),10 );
 var b = parseInt( (''+b).replace(/\s/g,''),10 );

 if ( r==null || g==null || b==null ||
     isNaN(r) || isNaN(g)|| isNaN(b) ) {
   alert ('Please enter numeric RGB values!');
   return;
 }
 if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
   alert ('RGB values must be in the range 0 to 255.');
   return;
 }
 r=r/255; g=g/255; b=b/255;
 var minRGB = Math.min(r,Math.min(g,b));
 var maxRGB = Math.max(r,Math.max(g,b));

 // Black-gray-white
 if (minRGB==maxRGB) {
  computedV = minRGB;
  return [0,0,computedV];
 }

 // Colors other than black-gray-white:
 var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
 var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
 computedH = 60*(h - d/(maxRGB - minRGB));
 computedS = (maxRGB - minRGB)/maxRGB;
 computedV = maxRGB;
 return [computedH,computedS,computedV];
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

function randomize(collection) {
  var randomNumber = Math.floor(Math.random() * collection.length);
  return collection[randomNumber]
}

function confetti() {
  if (confettiCount > 0) {
    var $confettiItems = $('<div class="confetti"></div>'),    
    colors = [
        foregroundColor,
        '#E9128C'
    ],
    height = 6.6,
    width = 6.6;
    
    var scale, $confettiItem;
  
    for(var i=0; i<100; i++) {
      scale = Math.random() * 1.75 + 1;
      $confettiItem = $('<svg class=\'confetti-item\' width=\'' + width * scale + '\' height=\'' + height * scale + '\' viewbox=\'0 0 ' + width + ' ' + height + '\'>\n  <use transform=\'rotate(' + Math.random() * 360 + ', ' + width / 2 + ', ' + height / 2 + ')\' xlink:href=\'#svg-confetti\' />\n</svg>');
      $confettiItem.css({
        'animation': Math.random() + .5 + 's ' + Math.random() * .5 + 's confettiFall ease-in both',
        'color': randomize(colors),
        'left': Math.random() * 100 + 'vw'
      });
      $confettiItems.append($confettiItem);
    }
    $('body').append($confettiItems)
  }

  confettiCount++
}