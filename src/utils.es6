import {asArray} from 'widjet-utils'

export function optionsOf (select) {
  return asArray(select.children)
}

export function selectedOptionsOf (select) {
  return optionsOf(select).filter(option => option.selected)
}
