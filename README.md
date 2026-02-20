# @low-res/formengine

A declarative, framework-agnostic form engine. Define your form fields once as plain configuration objects and get a fully reactive model with validation, dependent options, and value serialization — ready to wire up to any frontend framework.

Svelte 5 reference components are included out of the box.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Form](#form)
  - [Inputfield](#inputfield)
  - [Signal](#signal)
- [Field Types](#field-types)
- [Field Definition Reference](#field-definition-reference)
  - [Common properties](#common-properties)
  - [Options-based fields](#options-based-fields-select-select2-radio-checkbox-multiselect)
  - [Dependent options](#dependent-options)
  - [Input masks](#input-masks)
  - [File upload](#file-upload)
  - [Datetime with timezone](#datetime-with-timezone)
  - [Nested JSON form](#nested-json-form)
  - [Custom component](#custom-component)
- [Validation](#validation)
- [Configuration](#configuration)
- [Svelte 5 Components](#svelte-5-components)
- [Using with Other Frameworks](#using-with-other-frameworks)

---

## Installation

```bash
npm install @low-res/formengine
```

Peer dependencies: [`ko-fielddefinitions`](https://github.com/low-res/ko-fielddefinitions) (es6Rewrite branch), [`@low-res/validator`](https://github.com/low-res/validator).

---

## Quick Start

```js
import FieldsCollection from 'ko-fielddefinitions/fieldsCollection';
import { Form, configure } from '@low-res/formengine';

// 1. (Optional) plug in your translator
configure({
    translate: (key) => myTranslator.translate(key)
});

// 2. Define fields
const fields = new FieldsCollection({
    fields: [
        { name: 'firstName', label: 'First name', valueAccessor: 'firstName', type: 'input', validation: 'required' },
        { name: 'lastName',  label: 'Last name',  valueAccessor: 'lastName',  type: 'input', validation: 'required' },
        { name: 'email',     label: 'E-mail',     valueAccessor: 'email',     type: 'input', validation: 'required|email' },
    ],
    collections: [
        { name: 'edit', fields: ['firstName', 'lastName', 'email'] }
    ]
});

// 3. Create form, optionally with a source object to pre-fill values
const form = new Form(fields.getFormRows('edit'), { firstName: 'Ada', lastName: 'Lovelace' });

// 4. Handle submit
form.addSubmitHandler((values) => {
    console.log(values); // { firstName: 'Ada', lastName: 'Lovelace', email: null }
});

// 5. Validate and submit
if (form.validate()) {
    form.submit();
}
```

---

## Core Concepts

### Form

`Form` is the top-level model. It takes the output of `FieldsCollection.getFormRows()` and an optional source object.

```js
import { Form } from '@low-res/formengine';

const form = new Form(formRows, sourceObject);
```

**API**

| Method / Property | Description |
|---|---|
| `form.inputfields` | Array of all `Inputfield` instances |
| `form.validate()` | Validates all fields. Returns `true` if all pass. |
| `form.clear()` | Resets all fields to their empty state. |
| `form.submit()` | Calls all registered submit handlers with the current values. |
| `form.dismiss()` | Calls all registered dismiss handlers. |
| `form.getValues()` | Returns a plain object of `{ fieldname: value }` pairs, ready for submission. Supports dot-notation field names (e.g. `address.city`). |
| `form.getInputfield(name)` | Returns the `Inputfield` for the given field name. |
| `form.getAllFieldnames()` | Returns an array of all field names. |
| `form.setSource(source)` | Replaces the source object and re-populates all field values. |
| `form.addSubmitHandler(fn)` | Registers a submit handler `fn(values)`. |
| `form.addDismissHandler(fn)` | Registers a dismiss handler `fn(values)`. |
| `form.dispose()` | Cleans up all internal subscriptions. Call when tearing down the form. |
| `form.formRows` | The raw form rows array (for template iteration). |

---

### Inputfield

Each field definition becomes an `Inputfield` instance. You normally don't create these directly — `Form` creates and manages them.

```js
const inputfield = form.getInputfield('email');

inputfield.value.get();          // current value
inputfield.value.set('foo@bar'); // update value
inputfield.errors.get();         // current validation errors (array of keys)
inputfield.isValid;              // boolean
inputfield.validate();           // run validation, returns boolean
inputfield.clear();              // reset to empty
```

**API**

| Property / Method | Description |
|---|---|
| `inputfield.value` | `Signal` holding the current value |
| `inputfield.errors` | `ArraySignal` holding the current validation error keys |
| `inputfield.options` | `Signal<any[]>` for option-based fields (select, radio, …) — `undefined` for other types |
| `inputfield.isValid` | `true` when `errors` is empty |
| `inputfield.id` | Unique DOM id (auto-generated) |
| `inputfield.type` | Resolved field type string |
| `inputfield.validate()` | Runs validation, updates `errors`, returns `boolean` |
| `inputfield.validateOnlyIfValue()` | Validates only if the field has a value (useful for `onBlur`) |
| `inputfield.clear()` | Resets value to `null` (or `[]` for multi-value fields) |
| `inputfield.getFieldDefinition()` | Returns the underlying `Field` instance |
| `inputfield.getValueForServer()` | Returns the processed value ready for server submission |
| `inputfield.setSource(source)` | Re-reads the value from a new source object |
| `inputfield.dispose()` | Cleans up internal subscriptions |

---

### Signal

The reactive primitive underlying `value`, `errors`, and `options`. Compatible with the [Svelte store contract](https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) — `subscribe` calls the function immediately with the current value and returns an unsubscribe function.

```js
import { Signal, ArraySignal } from '@low-res/formengine';

const count = new Signal(0);

const unsub = count.subscribe(v => console.log(v)); // logs 0 immediately
count.set(1);    // logs 1
count.update(v => v + 1); // logs 2
unsub();         // stop listening

const tags = new ArraySignal(['a', 'b']);
tags.push('c');           // ['a', 'b', 'c']
tags.remove('b');         // ['a', 'c']
tags.clear();             // []
```

---

## Field Types

| Type | UI element | Notes |
|---|---|---|
| `input` | `<input type="text">` | Default. Use `keyboardtype` for `email`, `number`, etc. |
| `password` | `<input type="password">` | |
| `date` | `<input type="date">` | Value: `YYYY-MM-DD` string |
| `datetime` | `<input type="datetime-local">` | Value: `YYYY-MM-DDTHH:mm` string |
| `time` | `<input type="time">` | Value: `HH:mm` string |
| `text` | `<textarea>` | Multi-line text |
| `select` | `<select>` | Single selection. Set `multiple: true` for multi-selection. |
| `select2` | `<select>` | Like `select`, with native fallback. On mobile automatically falls back to a native select. |
| `radio` | Radio button group | |
| `checkbox` | Checkbox group | Value is always an array of selected values |
| `multiselect` | Custom dropdown with search | Value is an array |
| `file` | File input | Value is a `FileList` |
| `datetime-tz` | Date + timezone select | Value is a JSON string `{ date: ISO-UTC, tz: "..." }` |
| `json` | Nested sub-form | Value is a JSON string |
| `component` | Any custom Svelte component | Pass `componentClass` in the field definition |

---

## Field Definition Reference

Field definitions are plain objects passed to `FieldsCollection`. Every field must have at least `name`, `type`, and `valueAccessor`.

### Common properties

```js
{
    name: 'fieldname',           // Unique identifier. Also used as the key in getValues()
    type: 'input',               // Field type (see table above)
    valueAccessor: 'fieldname',  // How to read the initial value from the source object.
                                 // String → property path. Function → (source) => value.
    label: 'field.label.key',    // Label text or translation key
    validation: 'required',      // Validation rules (see Validation section)
    placeholder: 'hint text',    // Placeholder for input/textarea
    readonly: true,              // Renders the field as read-only
    keyboardtype: 'email',       // input type attribute (input fields only)
    info: 'some_info_key',       // Shows a help text below the label
    value: 'default value',      // Pre-set a static default value (alternative to source)
}
```

---

### Options-based fields (select, select2, radio, checkbox, multiselect)

```js
{
    name: 'status',
    type: 'select',
    valueAccessor: 'status',
    options: [
        { label: 'Active',   value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ],
    optionsValue: 'value',        // which property to use as the stored value
    optionsText: 'label',         // which property to display — or a function:
    // optionsText: (option, inputfield) => translate('prefix.' + option.label),
    labelprefix: 'status.',       // prepended to option values when used as translation keys
    optionscaption: 'general.optionscaption', // placeholder for the empty option (select only)
}
```

`optionsValue` and `optionsText` can each be a **string** (property name) or a **function** `(option, inputfield) => value`.

For **checkbox** groups, a "toggle all" button can be added:

```js
{ ..., type: 'checkbox', selectDeselectAll: true }
```

---

### Dependent options

Use `dependenedOptions` to compute a field's options dynamically based on other field values.

```js
{
    name: 'city',
    type: 'select',
    valueAccessor: 'city',
    options: [],
    dependenedOptions(form) {
        const country = form.getInputfield('country').value.get();
        return citiesByCountry[country] ?? [];
    }
}
```

The function receives the `Form` instance and is re-called whenever any other field's value changes.

---

### Input masks

Character masks for text inputs. All three properties must be set together.

```js
{
    name: 'date',
    type: 'input',
    valueAccessor: 'date',
    mask: '__.__.____',  // mask template
    mask_slots: '_',     // character(s) that represent editable positions
    mask_accept: '\\d',  // regex character class for accepted input
}
```

---

### File upload

```js
{
    name: 'avatar',
    type: 'file',
    valueAccessor: 'avatar',
    multiple: false,     // true to allow multiple files
}
```

The field value is a native `FileList` object.

---

### Datetime with timezone

```js
{
    name: 'eventTime',
    type: 'datetime-tz',
    valueAccessor: 'eventTime',
    timezones: [
        'UTC',
        'Europe/Berlin',
        'Europe/London',
        'America/New_York',
    ]
}
```

The stored value is a JSON string:
```json
{ "date": "2024-06-01T10:00:00.000Z", "tz": "Europe/Berlin" }
```

The date is always stored as UTC. Display conversion is handled automatically.

---

### Nested JSON form

Renders a sub-form whose collected values are serialized to a JSON string.

```js
{
    name: 'address',
    type: 'json',
    valueAccessor: 'address',
    fields: [
        { name: 'street', label: 'Street', valueAccessor: 'street', type: 'input' },
        { name: 'city',   label: 'City',   valueAccessor: 'city',   type: 'input', validation: 'required' },
        { name: 'zip',    label: 'ZIP',    valueAccessor: 'zip',    type: 'input' },
    ]
}
```

The stored value is a JSON string: `'{"street":"Musterstr. 1","city":"Vienna","zip":"1010"}'`.

---

### Custom component

Renders any custom Svelte component (or component from another framework).

```js
import MyPicker from './MyPicker.svelte';

{
    name: 'color',
    type: 'component',
    valueAccessor: 'color',
    componentClass: MyPicker,  // the component class/constructor itself
}
```

Your component receives `inputfield` as a prop:

```svelte
<script>
    let { inputfield } = $props();
    // read:  inputfield.value.get()
    // write: inputfield.value.set(newValue)
</script>
```

---

## Validation

Validation rules are defined as a string of `|`-separated rule names, an array, or a single string.

```js
validation: 'required'
validation: 'required|email'
validation: ['required', 'min:3']
```

Built-in rules (from `@low-res/validator`):

| Rule | Description |
|---|---|
| `required` | Value must not be empty (`null`, `''`, `[]`, `{}`) |
| `email` | Must be a valid e-mail address |
| `numerical` | Must be numeric (coerced to float on `getValueForServer()`) |

You can also pass a **custom validation function**:

```js
validation: (value, context) => value?.startsWith('A') ? true : 'error.must_start_with_a'
```

Or add global custom rules via `@low-res/validator`:

```js
import Validator from '@low-res/validator';
Validator.addValidation('phone', (value) => /^\+?[\d\s]+$/.test(value));
```

---

## Configuration

Call `configure()` once at application startup to integrate your translator:

```js
import { configure } from '@low-res/formengine';

configure({
    translate: (key) => i18n.t(key)  // any function (key: string) => string
});
```

If no translator is configured, keys are returned as-is.

---

## Svelte 5 Components

Import pre-built Svelte 5 components from `@low-res/formengine/svelte`:

```js
import { GenericForm, Formfield } from '@low-res/formengine/svelte';
```

### `<GenericForm>`

Renders a complete form with all rows, fields, and submit/cancel buttons.

```svelte
<script>
    import { GenericForm } from '@low-res/formengine/svelte';
</script>

<GenericForm
    {form}
    submitLabel="Save"
    cancelLabel="Cancel"
    showButtons={true}
    on:submit
    on:dismiss
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `form` | `Form` | required | The form model |
| `submitLabel` | `string` | `'general.save'` | Submit button label / translation key |
| `cancelLabel` | `string` | `'general.cancel'` | Cancel button label / translation key |
| `showButtons` | `boolean` | `true` | Whether to render the submit/cancel buttons |

### `<Formfield>`

Renders a single field with its label and error message. Handles all built-in field types automatically.

```svelte
<Formfield
    {inputfield}
    showLabels={true}
    hidden={false}
    tabindex={0}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `inputfield` | `Inputfield` | required | The field model |
| `showLabels` | `boolean` | `true` | Whether to render the label |
| `hidden` | `boolean` | `false` | Renders as `<input type="hidden">` |
| `tabindex` | `number` | `0` | Tab index passed to the native input |

### Individual field components

These are used internally by `<Formfield>` but can also be used directly:

```js
import {
    Formfield,
    GenericForm,
    Multiselect,
    DatepickerTz,
    Uploadfield,
    CustomJsonForm
} from '@low-res/formengine/svelte';
```

---

## Using with Other Frameworks

The core (`Form`, `Inputfield`, `Signal`) has no framework dependency. You can subscribe to `Signal` values and drive any reactive framework.

### Vue 3 example

```js
import { ref, onMounted, onUnmounted } from 'vue';
import { Form } from '@low-res/formengine';

export function useForm(formRows, source) {
    const form = new Form(formRows, source);

    const values = ref({});
    const errors = ref({});

    // Subscribe to each field
    const unsubs = form.inputfields.map(f => {
        const name = f.getFieldDefinition().name;
        return f.value.subscribe(v => { values.value[name] = v; });
    });

    onUnmounted(() => {
        unsubs.forEach(u => u());
        form.dispose();
    });

    return { form, values, errors };
}
```

### Vanilla JS example

```js
import { Form } from '@low-res/formengine';

const form = new Form(formRows, source);
const emailField = form.getInputfield('email');

// Subscribe to value changes
const unsub = emailField.value.subscribe(v => {
    document.getElementById('email-preview').textContent = v ?? '';
});

// Validate on submit
document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.validate()) {
        form.submit();
    }
});

// Clean up
window.addEventListener('beforeunload', () => {
    unsub();
    form.dispose();
});
```
