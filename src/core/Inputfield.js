import Field from 'ko-fielddefinitions/field';
import Validator from '@low-res/validator';
import { format as formatDate } from 'date-fns';
import { Signal, ArraySignal } from './Signal.js';

/**
 * Inputfield — framework-agnostic model for a single form field.
 *
 * Holds the current value and validation errors as Signals so any
 * frontend framework can subscribe to changes.
 *
 * Compatible with the Svelte store contract (subscribe returns unsubscribe fn).
 */
export class Inputfield {
    /** @type {Field} */
    fielddef;
    /** @type {string} */
    type;
    /** @type {string} */
    keyboardtype;
    /** @type {string|false} */
    readonly;
    /** @type {string} */
    id;
    /** @type {boolean} */
    selectMultiple;
    /** @type {number} */
    selectSize;

    /** Signal<any> — current value */
    value;
    /** Signal<string[]> — current validation error keys */
    errors;

    /** The Form this field belongs to (set via setContext) */
    context = null;

    /** @type {any} */
    source = null;

    #changeUnsubscribe = null;

    constructor(fielddef, source) {
        if (!(fielddef instanceof Field)) {
            console.warn(
                'Given fielddefinition must be of type Field. Trying to create Field from given data.'
            );
            fielddef = new Field(fielddef);
        }

        this.fielddef = fielddef;
        this.source = source;
        this.type = fielddef.type || 'input';
        this.keyboardtype = fielddef.keyboardtype || 'text';
        this.readonly = fielddef.readonly ? 'readonly' : false;
        this.id = fielddef.name
            ? fielddef.name + Math.floor(Math.random() * 100000)
            : 'fieldid_' + Math.floor(Math.random() * 100000);

        this.selectMultiple = fielddef.multiple ?? false;
        this.selectSize = fielddef.size ?? 1;

        if (fielddef.type === 'select' || fielddef.type === 'select2') {
            if (!fielddef.optionscaption) fielddef.optionscaption = 'general.optionscaption';
        }

        // On mobile, fall back select2 → native select
        if (this.type === 'select2' && this.#isMobileDevice()) {
            if (!Array.isArray(fielddef.options)) {
                fielddef.options = fielddef.options ? Object.values(fielddef.options) : [];
            }
            this.type = 'select';
        }

        this.errors = new ArraySignal([]);
        this.#initValueSignal();
        this.#initOptionsSignal();

        // Auto-validate on change if already invalid
        this.#changeUnsubscribe = this.value.subscribe((newValue) => {
            if (this.errors.get().length > 0) this.validate();
        });
    }


    // ─── Public API ──────────────────────────────────────────────────────────

    validate() {
        const v = this.fielddef.validation;
        const res = Validator.validate(this.value.get(), v, this.context);
        this.errors.set(Validator.getLastValidationErrors());
        return res;
    }

    /**
     * Only validate if there is a current value.
     * Useful for onBlur handlers.
     */
    validateOnlyIfValue() {
        if (this.getCurrentValue()) {
            return this.validate();
        }
        this.errors.set([]);
        return true;
    }

    get isValid() {
        return this.errors.get().length === 0;
    }

    clear() {
        this.setCurrentValue(this.#needsArrayAsValue() ? [] : null);
    }

    getCurrentValue() {
        return this.value.get();
    }

    setCurrentValue(newValue) {
        this.value.set(newValue);
    }

    setSource(source) {
        this.source = source;
        this.#inheritValueFromSource();
    }

    setContext(context) {
        this.context = context;
    }

    getFieldDefinition() {
        return this.fielddef;
    }

    /**
     * Returns the value formatted for server submission.
     * Handles date formatting, select optionsValue extraction,
     * numerical parsing, and custom processors.
     */
    getValueForServer() {
        const rawValue = this.getCurrentValue();
        let processedValue = rawValue;

        switch (this.fielddef.type) {
            case 'date':
                if (rawValue instanceof Date) {
                    processedValue = formatDate(rawValue, 'yyyy-MM-dd');
                }
                break;
            case 'select':
            case 'select2':
                if (this.fielddef.optionsValue) {
                    processedValue = rawValue?.[this.fielddef.optionsValue] ?? rawValue;
                }
                break;
        }

        if (Validator.containsValidation('numerical', this.fielddef.validation)) {
            processedValue = parseFloat(String(rawValue).replace(',', '.')) || 0;
        }

        if (typeof this.fielddef.valueForServerProcessor === 'function') {
            processedValue = this.fielddef.valueForServerProcessor(rawValue, {
                field: this.fielddef,
                source: this.source,
                context: this.context,
            });
        }

        return processedValue;
    }

    dispose() {
        if (this.#changeUnsubscribe) {
            this.#changeUnsubscribe();
            this.#changeUnsubscribe = null;
        }
    }


    // ─── Private ─────────────────────────────────────────────────────────────

    #initValueSignal() {
        let initialValue;

        if (this.fielddef.value !== undefined) {
            // Field has a pre-defined value / observable — use it directly
            // Wrap plain values in a Signal for uniform interface
            const v = this.fielddef.value;
            initialValue = typeof v === 'function' ? v() : v;
        } else {
            initialValue = this.#needsArrayAsValue() ? [] : null;
        }

        this.value = new Signal(initialValue);
        this.#inheritValueFromSource();
    }

    #initOptionsSignal() {
        const optsDef = this.fielddef.options;
        const typesWithOptions = ['select', 'select2', 'multiselect', 'radio', 'checkbox'];
        if (typesWithOptions.includes(this.type) || optsDef !== undefined) {
            const initial = typeof optsDef === 'function'
                ? optsDef()
                : (Array.isArray(optsDef) ? optsDef : []);
            this.options = new Signal(initial);
        }
    }

    #inheritValueFromSource() {
        if (!this.source) return;

        let v = this.fielddef.getFieldValue(this.source);

        if (this.#needsArrayAsValue()) {
            if (!Array.isArray(v)) {
                v = v ? [v] : [];
            }
        }

        this.value.set(v);
    }

    #needsArrayAsValue() {
        return (
            this.fielddef.type === 'checkbox' ||
            this.fielddef.type === 'multiselect' ||
            (this.fielddef.type === 'select' && this.selectMultiple)
        );
    }

    #isMobileDevice() {
        return (
            typeof window !== 'undefined' &&
            (typeof window.orientation !== 'undefined' ||
                navigator.userAgent.indexOf('IEMobile') !== -1)
        );
    }
}
