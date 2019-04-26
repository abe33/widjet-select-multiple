import widgets from 'widjet';
import {CompositeDisposable, DisposableEvent} from 'widjet-disposables';
import {asArray, addDelegatedEventListener, detachNode} from 'widjet-utils';
import {eachOptgroup, copyOptions, optionsOf, selectedOptionsOf} from './utils';

widgets.define('select-multiple', (options) => {
  const wrapperClass = options.wrapperClass || 'select-multiple';
  const itemsWrapperClass = options.itemsWrapperClass || 'values';
  const itemClass = options.itemClass || 'option';
  const itemLabelClass = options.itemLabelClass || 'label';
  const itemCloseClass = options.itemCloseClass || 'close';
  const itemCloseIconClass = options.itemCloseIconClass || 'fa fa-close';

  return (select) => {
    const parent = wrapSelect(select);
    const selector = document.createElement('select');
    const valuesContainer = document.createElement('div');
    const formatValue = options[select.getAttribute('data-format-value')] ||
                        options.formatValue ||
                        defaultFormatValue;

    valuesContainer.classList.add(itemsWrapperClass);

    selector.innerHTML = '<option style="display: none;"></option>';

    copyOptions(select, selector);
    updateDivsFromMultiple(valuesContainer, select, formatValue);
    updateSingleFromMultiple(selector, select);

    const subscriptions = new CompositeDisposable();

    subscriptions.add(new DisposableEvent(selector, 'change', (e) => {
      if (options.onSelect) {
        const res = options.onSelect(selector.value, select);
        if (typeof res.then == 'function') {
          res.then(confirm => {
            if (confirm) {
              updateMultipleFromSingleChanges(selector, select);
            } else {
              selector.selectedIndex = 0;
            }
          });
        } else {
          if (res) {
            updateMultipleFromSingleChanges(selector, select);
          } else {
            selector.selectedIndex = 0;
          }
        }
      } else {
        updateMultipleFromSingleChanges(selector, select);
      }
    }));

    subscriptions.add(new DisposableEvent(select, 'change', (e) => {
      updateDivsFromMultiple(valuesContainer, select, formatValue);
      updateSingleFromMultiple(selector, select);
    }));

    subscriptions.add(addDelegatedEventListener(valuesContainer, 'click', `.${itemCloseClass}`, (e) => {
      const value = e.target.parentNode.getAttribute('data-value');

      if (options.onUnselect) {
        const res = options.onUnselect(value, select);

        if (typeof res.then == 'function') {
          res.then(confirm => {
            if (confirm) {
              select.querySelector(`option[value="${value}"]`).selected = false;
              widgets.dispatch(select, 'change');
            }
          });
        } else if (res) {
          select.querySelector(`option[value="${value}"]`).selected = false;
          widgets.dispatch(select, 'change');
        }
      } else {
        select.querySelector(`option[value="${value}"]`).selected = false;
        widgets.dispatch(select, 'change');
      }
    }));

    parent.appendChild(selector);
    parent.appendChild(valuesContainer);

    return subscriptions;
  };

  function wrapSelect(select) {
    const parent = document.createElement('div');
    parent.classList.add(wrapperClass);
    select.parentNode.insertBefore(parent, select);
    parent.appendChild(select);
    return parent;
  }

  function updateSingleFromMultiple(single, multiple) {
    const singleOptions = optionsOf(single);
    const multipleOptions = selectedOptionsOf(multiple).map(option => option.value);

    singleOptions.forEach((option) => {
      option.selected = false;
      !option.value || multipleOptions.indexOf(option.value) !== -1
        ? option.style.display = 'none'
        : option.removeAttribute('style');
    });

    eachOptgroup(single, (group) => {
      asArray(group.children).every(n => n.style.display === 'none')
        ? group.style.display = 'none'
        : group.removeAttribute('style');
    });
  }

  function updateMultipleFromSingleChanges(single, multiple) {
    const multipleOptions = selectedOptionsOf(multiple);
    const singleOptions = selectedOptionsOf(single);
    const added = singleOptions.filter(option => multipleOptions.indexOf(option.value) === -1)[0];

    multiple.querySelector(`option[value="${added.value}"]`).selected = true;
    widgets.dispatch(multiple, 'change');
  }

  function updateDivsFromMultiple(container, multiple, formatValue) {
    const multipleOptions = selectedOptionsOf(multiple);
    const multipleOptionsValues = multipleOptions.map(option => option.value);

    asArray(container.children).forEach((div) => {
      if (multipleOptionsValues.indexOf(div.getAttribute('data-value')) === -1) {
        detachNode(div);
      }
    });

    multipleOptions.forEach((option) => {
      if (!container.querySelector(`[data-value="${option.value}"]`)) {
        container.appendChild(formatValue(option));
      }
    });
  }

  function defaultFormatValue(option) {
    const div = document.createElement('div');
    div.classList.add(itemClass);
    div.setAttribute('data-value', option.value);
    div.innerHTML = `
      <span class="${itemLabelClass}">${option.textContent}</span>
      <button type="button" class="${itemCloseClass}" tabindex="-1">
        <i class="${itemCloseIconClass}"></i>
      </button>
    `;

    return div;
  }
});
