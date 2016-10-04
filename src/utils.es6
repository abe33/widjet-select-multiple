import {asArray, curry2} from 'widjet-utils'

export const isNode = curry2((name, node) => {
  return node.nodeName === name.toUpperCase()
})

export const isOption = isNode('option')
export const isOptgroup = isNode('optgroup')

export function copyOptions (from, to) {
  const content = asArray(from.children)
  content.map(child =>
    isOptgroup(child) ? copyOptgroup(child) : copyOption(child)
  )
  .forEach(copy => to.appendChild(copy))
}

export function copyOptgroup (optgroup) {
  const copy = document.createElement('optgroup')
  copy.label = optgroup.label
  copyOptions(optgroup, copy)
  return copy
}

export function copyOption (option) {
  const copy = document.createElement('option')
  copy.value = option.value
  copy.textContent = option.textContent
  return copy
}

export function optionsOf (select) {
  return asArray(select.querySelectorAll('option'))
}

export function eachOptgroup (node, block) {
  asArray(node.children).filter(n => isOptgroup(n)).forEach(group => {
    eachOptgroup(group, block)
    block(group)
  })
}

export function selectedOptionsOf (select) {
  return optionsOf(select).filter(option => option.selected)
}
