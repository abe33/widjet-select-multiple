import {asArray} from 'widjet-utils'

export function copyOption (option) {
  const copy = document.createElement('option')
  copy.value = option.value
  copy.textContent = option.textContent
  return copy
}

export function optionsOf (select) {
  return asArray(select.querySelectorAll('option'))
}

export function selectedOptionsOf (select) {
  return optionsOf(select).filter(option => option.selected)
}
