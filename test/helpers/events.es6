
export const mousedown = generateMouseEventMethod('mousedown')
export const mouseover = generateMouseEventMethod('mouseover')
export const mouseout = generateMouseEventMethod('mouseout')
export const mousemove = generateMouseEventMethod('mousemove')
export const mouseup = generateMouseEventMethod('mouseup')
export const click = generateMouseEventMethod('click')

export const mousewheel = (obj, deltaX = 0, deltaY = 0) => {
  obj.dispatchEvent(mouseEvent('mousewheel', {
    deltaX,
    deltaY,
    wheelDeltaX: deltaX,
    wheelDeltaY: deltaY
  }))
}

export const touchstart = generateTouchEventMethod('touchstart')
export const touchmove = generateTouchEventMethod('touchmove')
export const touchend = generateTouchEventMethod('touchend')

export function mouseEvent (type, properties) {
  let defaults = {
    bubbles: true,
    cancelable: (type !== 'mousemove'),
    view: window,
    detail: 0,
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0
  }

  for (let k in defaults) {
    let v = defaults[k]
    if (!(properties[k] != null)) {
      properties[k] = v
    }
  }

  const e = new window.MouseEvent(type, properties)

  for (let k in properties) {
    if (e[k] !== properties[k]) {
      e[k] = properties[k]
    }
  }

  return e
}

export function touchEvent (type, touches) {
  let event = new window.Event(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  })
  event.touches = event.changedTouches = event.targetTouches = touches

  return event
}

export function inputEvent (type, properties = {}) {
  return new window.KeyboardEvent(type, properties)
}

export function objectCenterCoordinates (obj) {
  let {top, left, width, height} = obj.getBoundingClientRect()
  return {x: left + width / 2, y: top + height / 2}
}

function generateMouseEventMethod (name) {
  return (obj, {x, y, cx, cy, btn} = {}) => {
    if (!((typeof x !== 'undefined' && x !== null) && (typeof y !== 'undefined' && y !== null))) {
      let o = objectCenterCoordinates(obj)
      x = o.x
      y = o.y
    }

    if (!((typeof cx !== 'undefined' && cx !== null) && (typeof cy !== 'undefined' && cy !== null))) {
      cx = x
      cy = y
    }

    obj.dispatchEvent(mouseEvent(name, {
      pageX: x, pageY: y, clientX: cx, clientY: cy, button: btn
    }))
  }
}

function generateTouchEventMethod (name) {
  return (obj, touches) => {
    if (!Array.isArray(touches)) {
      touches = [touches]
    }

    touches.forEach((touch) => {
      if (!exists(touch.target)) {
        touch.target = obj
      }

      if (!(exists(touch.pageX) && exists(touch.pageY))) {
        let o = objectCenterCoordinates(obj)
        touch.pageX = exists(touch.x) ? touch.x : o.x
        touch.pageY = exists(touch.y) ? touch.y : o.y
      }

      if (!(exists(touch.clientX) && exists(touch.clientY))) {
        touch.clientX = touch.pageX
        touch.clientY = touch.pageY
      }
    })

    obj.dispatchEvent(touchEvent(name, touches))
  }
}

function exists (value) {
  return (typeof value !== 'undefined' && value !== null)
}
