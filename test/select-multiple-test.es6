import expect from 'expect.js';
import jsdom from 'mocha-jsdom';
import widgets from 'widjet';
import {getNode} from 'widjet-utils';
import {click} from 'widjet-test-utils/events';
import {setPageContent, getTestRoot} from 'widjet-test-utils/dom';
import {waitsFor} from 'widjet-test-utils/async';

import '../src/index';
import {selectedOptionsOf, isNode} from '../src/utils';

describe('select-multiple', () => {
  jsdom({url: 'http://localhost'});

  let select, wrapper, singleSelect, values;

  describe('without options', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');

      widgets('select-multiple', 'select[multiple]', {on: 'init'});

      wrapper = select.parentNode;
      singleSelect = wrapper.querySelector('select:not([multiple])');
      values = wrapper.querySelector('.values');
    });

    it('wraps the select into a .select-multiple div', () => {
      expect(isNode('div', wrapper)).to.be.ok();
      expect(wrapper.classList.contains('select-multiple')).to.be.ok();
    });

    it('creates a div to display selected values', () => {
      expect(values).not.to.be(null);
      expect(values.children).to.have.length(2);
    });

    it('creates a single select with only the remaining selectable value displayed', () => {
      expect(singleSelect).not.to.be(null);
      expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
      expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
    });

    it('creates an empty selected option in the single select', () => {
      expect(singleSelect).not.to.be(null);
      expect(singleSelect.querySelectorAll('option:not([value])')).to.have.length(1);
    });

    describe('clicking on an item close button', () => {
      beforeEach(() => {
        const button = wrapper.querySelector('.values .close');

        click(button);
      });

      it('removes the corresponding value from the values div', () => {
        expect(values.children).to.have.length(1);
      });

      it('updates the visible options in the single select', () => {
        expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(2);
        expect(singleSelect.querySelectorAll('option[style]')).to.have.length(2);
      });

      it('updates the selected options in the origin multiple select', () => {
        expect(selectedOptionsOf(select)).to.have.length(1);
      });
    });

    describe('selecting a value in the single select', () => {
      beforeEach(() => {
        singleSelect.querySelector('option[value]').selected = true;
        widgets.dispatch(singleSelect, 'change');
      });

      it('updates the displayed values', () => {
        expect(values.children).to.have.length(3);
      });

      it('updates the multiple select values', () => {
        expect(selectedOptionsOf(select)).to.have.length(3);
      });

      it('hides the selected option in the single select', () => {
        expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(0);
        expect(singleSelect.querySelectorAll('option[style]')).to.have.length(4);
      });
    });

    describe('when the select has option groups', () => {
      beforeEach(() => {
        setPageContent(`
          <select multiple>
            <optgroup label='first'>
              <option value='foo'>Foo</option>
            </optgroup>

            <optgroup label='second'>
              <option value='bar' selected>Bar</option>
              <option value='baz' selected>Baz</option>
            </optgroup>
          </select>
        `);

        select = getTestRoot().querySelector('select');

        widgets('select-multiple', 'select[multiple]', {on: 'init'});

        wrapper = select.parentNode;
        singleSelect = wrapper.querySelector('select:not([multiple])');
        values = wrapper.querySelector('.values');
      });

      it('replicates the option groups in the single select', () => {
        expect(singleSelect.querySelectorAll('optgroup')).to.have.length(2);
        expect(singleSelect.querySelector('optgroup[label="first"]').children).to.have.length(1);
        expect(singleSelect.querySelector('optgroup[label="second"]').children).to.have.length(2);

        expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
        expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
      });

      it('hides option groups with all their options hidden', () => {
        expect(singleSelect.querySelectorAll('optgroup[style]')).to.have.length(1);
      });
    });
  });

  describe('with custom async actions validator', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');
    });

    describe('that returns a truthy value', () => {
      let resolved;

      beforeEach(() => {
        widgets('select-multiple', 'select[multiple]', {
          on: 'init',
          onSelect() {
            resolved = true;
            return Promise.resolve(true);
          },
          onUnselect() {
            resolved = true;
            return Promise.resolve(true);
          },
        });

        wrapper = select.parentNode;
        singleSelect = wrapper.querySelector('select:not([multiple])');
        values = wrapper.querySelector('.values');
      });

      describe('clicking on an item close button', () => {
        beforeEach(() => {
          const button = wrapper.querySelector('.values .close');

          click(button);

          return waitsFor('promise to resolve', () => resolved);
        });

        it('removes the corresponding value from the values div', () => {
          expect(values.children).to.have.length(1);
        });

        it('updates the visible options in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(2);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(2);
        });

        it('updates the selected options in the origin multiple select', () => {
          expect(selectedOptionsOf(select)).to.have.length(1);
        });
      });

      describe('selecting a value in the single select', () => {
        beforeEach(() => {
          singleSelect.querySelector('option[value]').selected = true;
          widgets.dispatch(singleSelect, 'change');

          return waitsFor('promise to resolve', () => resolved);
        });

        it('updates the displayed values', () => {
          expect(values.children).to.have.length(3);
        });

        it('updates the multiple select values', () => {
          expect(selectedOptionsOf(select)).to.have.length(3);
        });

        it('hides the selected option in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(0);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(4);
        });
      });
    });

    describe('that returns a falsy value', () => {
      let resolved;

      beforeEach(() => {
        widgets('select-multiple', 'select[multiple]', {
          on: 'init',
          onSelect() {
            resolved = true;
            return Promise.resolve(false);
          },
          onUnselect() {
            resolved = true;
            return Promise.resolve(false);
          },
        });

        wrapper = select.parentNode;
        singleSelect = wrapper.querySelector('select:not([multiple])');
        values = wrapper.querySelector('.values');
      });

      describe('clicking on an item close button', () => {
        beforeEach(() => {
          const button = wrapper.querySelector('.values .close');

          click(button);

          return waitsFor('promise to resolve', () => resolved);
        });

        it('does not remove the corresponding value from the values div', () => {
          expect(values.children).to.have.length(2);
        });

        it('does not update the visible options in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
        });

        it('does not update the selected options in the origin multiple select', () => {
          expect(selectedOptionsOf(select)).to.have.length(2);
        });
      });

      describe('selecting a value in the single select', () => {
        beforeEach(() => {
          singleSelect.querySelector('option[value]').selected = true;
          widgets.dispatch(singleSelect, 'change');

          return waitsFor('promise to resolve', () => resolved);
        });

        it('does not update the displayed values', () => {
          expect(values.children).to.have.length(2);
        });

        it('does not update the multiple select values', () => {
          expect(selectedOptionsOf(select)).to.have.length(2);
        });

        it('does not hide the selected option in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
        });

        it('resets the single select selected value', () => {
          expect(singleSelect.value).to.eql('');
        });
      });
    });
  });

  describe('with custom sync actions validator', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');
    });

    describe('that returns a truthy value', () => {
      beforeEach(() => {
        widgets('select-multiple', 'select[multiple]', {
          on: 'init',
          onSelect() {
            return true;
          },
          onUnselect() {
            return true;
          },
        });

        wrapper = select.parentNode;
        singleSelect = wrapper.querySelector('select:not([multiple])');
        values = wrapper.querySelector('.values');
      });

      describe('clicking on an item close button', () => {
        beforeEach(() => {
          const button = wrapper.querySelector('.values .close');

          click(button);
        });

        it('removes the corresponding value from the values div', () => {
          expect(values.children).to.have.length(1);
        });

        it('updates the visible options in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(2);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(2);
        });

        it('updates the selected options in the origin multiple select', () => {
          expect(selectedOptionsOf(select)).to.have.length(1);
        });
      });

      describe('selecting a value in the single select', () => {
        beforeEach(() => {
          singleSelect.querySelector('option[value]').selected = true;
          widgets.dispatch(singleSelect, 'change');
        });

        it('updates the displayed values', () => {
          expect(values.children).to.have.length(3);
        });

        it('updates the multiple select values', () => {
          expect(selectedOptionsOf(select)).to.have.length(3);
        });

        it('hides the selected option in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(0);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(4);
        });
      });
    });

    describe('that returns a falsy value', () => {
      beforeEach(() => {
        widgets('select-multiple', 'select[multiple]', {
          on: 'init',
          onSelect() {
            return false;
          },
          onUnselect() {
            return false;
          },
        });

        wrapper = select.parentNode;
        singleSelect = wrapper.querySelector('select:not([multiple])');
        values = wrapper.querySelector('.values');
      });

      describe('clicking on an item close button', () => {
        beforeEach(() => {
          const button = wrapper.querySelector('.values .close');

          click(button);
        });

        it('does not remove the corresponding value from the values div', () => {
          expect(values.children).to.have.length(2);
        });

        it('does not update the visible options in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
        });

        it('does not update the selected options in the origin multiple select', () => {
          expect(selectedOptionsOf(select)).to.have.length(2);
        });
      });

      describe('selecting a value in the single select', () => {
        beforeEach(() => {
          singleSelect.querySelector('option[value]').selected = true;
          widgets.dispatch(singleSelect, 'change');
        });

        it('does not update the displayed values', () => {
          expect(values.children).to.have.length(2);
        });

        it('does not update the multiple select values', () => {
          expect(selectedOptionsOf(select)).to.have.length(2);
        });

        it('does not hide the selected option in the single select', () => {
          expect(singleSelect.querySelectorAll('option:not([style])')).to.have.length(1);
          expect(singleSelect.querySelectorAll('option[style]')).to.have.length(3);
        });

        it('resets the single select selected value', () => {
          expect(singleSelect.value).to.eql('');
        });
      });
    });
  });

  describe('with custom classes in options', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');

      widgets('select-multiple', 'select[multiple]', {
        on: 'init',
        wrapperClass: 'multiple-select',
        itemsWrapperClass: 'option-values',
        itemClass: 'option-value',
        itemLabelClass: 'option-label',
        itemCloseClass: 'option-close',
        itemCloseIconClass: 'option-icon',
      });

      wrapper = select.parentNode;
      values = wrapper.querySelector('.option-values');
    });

    it('uses the passed-in classes', () => {
      expect(wrapper.classList.contains('multiple-select')).to.be.ok();
      expect(values).not.to.be(null);
      expect(values.querySelectorAll('.option-value')).to.have.length(2);
      expect(values.querySelectorAll('.option-label')).to.have.length(2);
      expect(values.querySelectorAll('.option-close')).to.have.length(2);
      expect(values.querySelectorAll('.option-icon')).to.have.length(2);
    });
  });

  describe('with many custom classes in options', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');

      widgets('select-multiple', 'select[multiple]', {
        on: 'init',
        wrapperClass: 'multiple-select foo',
        itemsWrapperClass: 'option-values foo',
        itemClass: 'option-value foo',
        itemLabelClass: 'option-label foo',
        itemCloseClass: 'option-close foo',
        itemCloseIconClass: 'option-icon foo',
      });

      wrapper = select.parentNode;
      values = wrapper.querySelector('.option-values.foo');
    });

    it('uses the passed-in classes', () => {
      expect(wrapper.classList.contains('multiple-select')).to.be.ok();
      expect(wrapper.classList.contains('foo')).to.be.ok();
      expect(values).not.to.be(null);
      expect(values.querySelectorAll('.option-value.foo')).to.have.length(2);
      expect(values.querySelectorAll('.option-label.foo')).to.have.length(2);
      expect(values.querySelectorAll('.option-close.foo')).to.have.length(2);
      expect(values.querySelectorAll('.option-icon.foo')).to.have.length(2);
    });
  });

  describe('with a custom value builder', () => {
    beforeEach(() => {
      setPageContent(`
        <select multiple>
          <option value='foo'>Foo</option>
          <option value='bar' selected>Bar</option>
          <option value='baz' selected>Baz</option>
        </select>
      `);

      select = getTestRoot().querySelector('select');

      widgets('select-multiple', 'select[multiple]', {
        on: 'init',
        formatValue: () => getNode('<div class="foo">foo</div>'),
      });

      wrapper = select.parentNode;
      values = wrapper.querySelector('.values');
    });

    it('calls the function to creates the values', () => {
      expect(values.querySelectorAll('.foo')).to.have.length(2);
    });

    describe('on the select itself', () => {
      beforeEach(() => {
        setPageContent(`
          <select multiple data-format-value='someFormatter'>
            <option value='foo'>Foo</option>
            <option value='bar' selected>Bar</option>
            <option value='baz' selected>Baz</option>
          </select>
        `);

        select = getTestRoot().querySelector('select');

        widgets('select-multiple', 'select[multiple]', {
          on: 'init',
          someFormatter: () => getNode('<div class="foo">foo</div>'),
        });

        wrapper = select.parentNode;
        values = wrapper.querySelector('.values');
      });

      it('calls the function to creates the values', () => {
        expect(values.querySelectorAll('.foo')).to.have.length(2);
      });
    });
  });
});
