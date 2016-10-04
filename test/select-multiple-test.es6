import expect from 'expect.js'
import jsdom from 'mocha-jsdom'
import widgets from 'widjet'
import {click} from 'widjet-test-utils/events'

import '../src/index'
import {selectedOptionsOf, isNode} from '../src/utils'

describe('select-multiple', () => {
  jsdom()

  let select, wrapper, singleSelect, values

  beforeEach(() => {
    document.body.innerHTML = `
      <select multiple>
        <option value='foo'>Foo</option>
        <option value='bar' selected>Bar</option>
        <option value='baz' selected>Baz</option>
      </select>
    `

    select = document.querySelector('select')

    widgets('select-multiple', 'select[multiple]', {on: 'init'})

    wrapper = select.parentNode
    singleSelect = wrapper.querySelector('select:not([multiple])')
    values = wrapper.querySelector('.values')
  })

  it('wraps the select into a .select-multiple div', () => {
    expect(isNode('div', wrapper)).to.be.ok()
    expect(wrapper.classList.contains('select-multiple')).to.be.ok()
  })

  it('creates a div to display selected values', () => {
    expect(values).not.to.be(null)
    expect(values.children).to.have.length(2)
  })

  it('creates a single select with only the remaining selectable value displayed', () => {
    expect(singleSelect).not.to.be(null)
    expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1)
    expect(singleSelect.querySelectorAll('option[style]')).to.have.length(2)
  })

  describe('clicking on an item close button', () => {
    beforeEach(() => {
      const button = wrapper.querySelector('.values .close')

      click(button)
    })

    it('removes the corresponding value from the values div', () => {
      expect(values.children).to.have.length(1)
    })

    it('updates the visible options in the single select', () => {
      expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(2)
      expect(singleSelect.querySelectorAll('option[style]')).to.have.length(1)
    })

    it('updates the selected options in the origin multiple select', () => {
      expect(selectedOptionsOf(select)).to.have.length(1)
    })
  })

  describe('selecting a value in the single select', () => {
    beforeEach(() => {
      singleSelect.querySelector('option').selected = true
      widgets.dispatch(singleSelect, 'change')
    })

    it('updates the displayed values', () => {
      expect(values.children).to.have.length(3)
    })

    it('updates the multiple select values', () => {
      expect(selectedOptionsOf(select)).to.have.length(3)
    })

    it('hides the selected option in the single select', () => {
      expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(0)
      expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3)
    })
  })

  describe('when the select has option groups', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select multiple>
          <optgroup label='first'>
            <option value='foo'>Foo</option>
          </optgroup>

          <optgroup label='second'>
            <option value='bar' selected>Bar</option>
            <option value='baz' selected>Baz</option>
          </optgroup>
        </select>
      `

      select = document.querySelector('select')

      widgets('select-multiple', 'select[multiple]', {on: 'init'})

      wrapper = select.parentNode
      singleSelect = wrapper.querySelector('select:not([multiple])')
      values = wrapper.querySelector('.values')
    })

    it('replicates the option groups in the single select', () => {
      expect(singleSelect.querySelectorAll('optgroup')).to.have.length(2)
      expect(singleSelect.querySelector('optgroup[label="first"]').children).to.have.length(1)
      expect(singleSelect.querySelector('optgroup[label="second"]').children).to.have.length(2)

      expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1)
      expect(singleSelect.querySelectorAll('option[style]')).to.have.length(2)
    })

    it('hides option groups with all their options hidden', () => {
      expect(singleSelect.querySelectorAll('optgroup[style]')).to.have.length(1)
    })
  })
})
