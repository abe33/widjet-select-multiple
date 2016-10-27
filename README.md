# widjet-select-multiple [![Build Status](https://travis-ci.org/abe33/widjet-select-multiple.svg?branch=master)](https://travis-ci.org/abe33/widjet-select-multiple) [![codecov](https://codecov.io/gh/abe33/widjet-select-multiple/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-select-multiple)

A widget to make multiple select more user friendly.

## Install

```shell
npm install widjet-select-multiple --save
```

## Usage

```js
import widgets from 'widjet'
import 'widjet-select-multiple'

widgets('select-multiple', 'select[multiple]', {on: 'load'})
```

The `select-multiple` widget operates on `select` inputs with the `multiple` attribute defined. It replaces the traditionnal list UI with a new DOM you can style as you see fit. From a single select element you end up with a div containing the original select, a new select that displays only the values that are not selected yet and another div containing the selected values represented as divs with a close button in them (this is the default value formatting, but it can be change through options).

The basic behaviour is that when an item is selected in the single select, that values is selected in the multiple select, disabled in the single select and displayed in the selected values div using the formatting function.
When clicking on the close button the inverse process is performed, the option is unselected in the multiple select, enabled in the single select and removed from the selected values div.

### Options

Option|Type|Description
---|---|---
`wrapperClass`|`string`|The class name to use for the wrapper div around the initial select. Defaults to `select-multiple`.
`itemsWrapperClass`|`string`|The class name to use for the selected values wrapper. Defaults to `values`.
`itemClass`|`string`|The class name for the selected values div. Defaults to `option`.
`itemLabelClass`|`string`|The class name for the selected value labels. Defaults to `label`.
`itemCloseClass`|`string`|The class name for the selected value close buttons. This class is used as the selector to bind events handler so that the selected values can be unselected when clicking on the buttons. Defaults to `close`.
`itemCloseIconClass`|`string`|The class name for the close button icons. Defaults to `fa fa-close`.
`formatValue`|`function`|A function that takes an option as argument and should return the DOM element that will represent this option in the selected values div.
