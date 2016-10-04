import widgets from 'widjet'
import {CompositeDisposable, DisposableEvent} from 'widjet-disposables'
import {asArray, addDelegatedEventListener, detachNode} from 'widjet-utils'
import {optionsOf, selectedOptionsOf} from './utils'

widgets.define('select-multiple', (options) => {
  return (select) => {
    const parent = document.createElement('div')
    parent.classList.add('select-multiple')
    select.parentNode.insertBefore(parent, select)
    parent.appendChild(select)

    const options = asArray(select.querySelectorAll('option'))
    const selector = document.createElement('select')
    const valuesContainer = document.createElement('div')

    valuesContainer.classList.add('values')

    options.forEach((option) => {
      const copy = document.createElement('option')
      copy.value = option.value
      copy.textContent = option.textContent
      selector.appendChild(copy)
    })

    updateDivsFromMultiple(valuesContainer, select)
    updateSingleFromMultiple(selector, select)

    const subscriptions = new CompositeDisposable()

    subscriptions.add(new DisposableEvent(selector, 'change', (e) => {
      updateMultipleFromSingleChanges(selector, select)
    }))

    subscriptions.add(new DisposableEvent(select, 'change', (e) => {
      updateDivsFromMultiple(valuesContainer, select)
      updateSingleFromMultiple(selector, select)
    }))

    subscriptions.add(addDelegatedEventListener(valuesContainer, 'click', '.option .close', (e) => {
      const value = e.target.parentNode.getAttribute('data-value')

      select.querySelector(`option[value="${value}"]`).selected = false
      widgets.dispatch(select, 'change')
    }))

    parent.appendChild(selector)
    parent.appendChild(valuesContainer)

    return subscriptions
  }

  function updateSingleFromMultiple (single, multiple) {
    const singleOptions = optionsOf(single)
    const multipleOptions = selectedOptionsOf(multiple).map(option => option.value)

    singleOptions.forEach((option) => {
      option.selected = false
      multipleOptions.indexOf(option.value) !== -1
        ? option.style.display = 'none'
        : option.removeAttribute('style')
    })
  }

  function updateMultipleFromSingleChanges (single, multiple) {
    const multipleOptions = selectedOptionsOf(multiple)
    const singleOptions = selectedOptionsOf(single)
    const added = singleOptions.filter(option => multipleOptions.indexOf(option.value) === -1)[0]

    multiple.querySelector(`option[value="${added.value}"]`).selected = true
    widgets.dispatch(multiple, 'change')
  }

  function updateDivsFromMultiple (container, multiple) {
    const multipleOptions = selectedOptionsOf(multiple)
    const multipleOptionsValues = multipleOptions.map(option => option.value)

    asArray(container.children).forEach((div) => {
      if (multipleOptionsValues.indexOf(div.getAttribute('data-value')) === -1) {
        detachNode(div)
      }
    })

    multipleOptions.forEach((option) => {
      if (!container.querySelector(`[data-value="${option.value}"]`)) {
        container.appendChild(getOptionDiv(option))
      }
    })
  }

  function getOptionDiv (option) {
    const div = document.createElement('div')
    div.classList.add('option')
    div.setAttribute('data-value', option.value)
    div.innerHTML = `<span class="option-label">${option.textContent}</span><button class="close"><i class="fa fa-close"></i></button>`

    return div
  }
})
