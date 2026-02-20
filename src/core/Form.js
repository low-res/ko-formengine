import Field from 'ko-fielddefinitions/field';
import { unwrap } from 'ko-fielddefinitions/utils';
import { Inputfield } from './Inputfield.js';

/**
 * Form — framework-agnostic model for a complete form.
 *
 * Accepts a formRows array (as produced by FieldsCollection.getFormRows())
 * and an optional source object to pre-populate field values.
 *
 * Usage:
 *   import { Form } from '@low-res/formengine';
 *   const form = new Form(fields.getFormRows('edit'), sourceObject);
 *   form.addSubmitHandler(values => api.save(values));
 */
export class Form {
    /** @type {Inputfield[]} */
    inputfields = [];

    /** @type {Function[]} */
    submitHandlers = [];

    /** @type {Function[]} */
    dismissHandlers = [];

    #formRows;
    #source;
    #dependencyUnsubs = [];

    constructor(formRows, source) {
        this.#formRows = formRows;
        this.#source = source;
        this.#prepareInputfieldModels();
    }


    // ─── Public API ──────────────────────────────────────────────────────────

    validate() {
        return this.inputfields.reduce((valid, field) => {
            return field.validate() && valid;
        }, true);
    }

    clear() {
        this.inputfields.forEach(field => field.clear());
    }

    /**
     * Calls all registered submit handlers with the current form values.
     * Returns an array of whatever the handlers return (can be Promises).
     */
    submit() {
        const values = this.getValues();
        return this.submitHandlers
            .filter(h => typeof h === 'function')
            .map(h => h(values));
    }

    /**
     * Calls all registered dismiss handlers.
     */
    dismiss() {
        const values = this.getValues();
        this.dismissHandlers
            .filter(h => typeof h === 'function')
            .forEach(h => h(values));
    }

    setSource(source) {
        this.#source = source;
        this.inputfields.forEach(field => field.setSource(source));
    }

    /**
     * Returns a flat object of all field values, keyed by field name.
     * Supports dot-notation names (e.g. "address.city") via nested assignment.
     */
    getValues() {
        const result = {};
        for (const field of this.inputfields) {
            const name = field.getFieldDefinition().name;
            const value = field.getValueForServer();
            if (name) {
                // Support dot-notation field names
                setNested(result, name, value);
            }
        }
        return result;
    }

    getInputfield(fieldname) {
        return this.inputfields.find(
            f => f.getFieldDefinition().name === fieldname
        );
    }

    getAllFieldnames() {
        return this.inputfields.map(f => f.getFieldDefinition().name);
    }

    addSubmitHandler(handler) {
        if (typeof handler !== 'function') {
            throw new Error('Only functions can be added as submit handlers');
        }
        this.submitHandlers.push(handler);
    }

    addDismissHandler(handler) {
        if (typeof handler !== 'function') {
            throw new Error('Only functions can be added as dismiss handlers');
        }
        this.dismissHandlers.push(handler);
    }

    /**
     * Clean up all subscriptions.
     */
    dispose() {
        this.#dependencyUnsubs.forEach(unsub => unsub());
        this.#dependencyUnsubs = [];
        this.inputfields.forEach(f => f.dispose());
    }


    // ─── Private ─────────────────────────────────────────────────────────────

    /**
     * Iterates formRows, creates an Inputfield for every field definition,
     * injects the Inputfield back into the row object (for easy template rendering),
     * and wires up dependenedOptions.
     */
    #prepareInputfieldModels() {
        const fields = [];
        const rows = unwrap(this.#formRows) ?? [];

        for (const row of rows) {
            for (const cell of row) {
                if (!cell.field) continue;

                const fieldDef = cell.field instanceof Field
                    ? cell.field
                    : cell.field; // FieldsCollection already provides Field instances

                const inputfield = new Inputfield(fieldDef, this.#source);
                inputfield.setContext(this);
                fields.push(inputfield);

                // Inject back into the row cell so templates can access it directly
                if (!cell.inputfield) cell.inputfield = inputfield;
            }
        }

        this.inputfields = fields;

        // Wire up dependenedOptions after all inputfields exist
        for (const row of rows) {
            for (const cell of row) {
                if (!cell.field) continue;
                this.#handleDependenedOptions(cell.field, cell.inputfield);
            }
        }
    }

    /**
     * If a field definition has a `dependenedOptions` function, subscribe to
     * all field value changes and recompute options whenever anything changes.
     *
     * dependenedOptions(form) should return an array of options.
     */
    #handleDependenedOptions(fielddef, inputfield) {
        if (!fielddef.dependenedOptions) return;

        const type = fielddef.type;
        if (type !== 'select' && type !== 'multiselect') {
            if (type === 'select2') {
                console.warn('dependenedOptions on select2 fields is not supported yet.');
            }
            return;
        }

        const computeOptions = () => {
            const opts = fielddef.dependenedOptions.call(inputfield, this);
            const resolved = opts ?? [];
            fielddef.options = resolved;
            if (inputfield.options) inputfield.options.set(resolved);
        };

        // Compute immediately
        computeOptions();

        // Re-compute whenever any field value changes
        for (const f of this.inputfields) {
            // skip self to avoid pointless re-computes when this field's value changes
            if (f === inputfield) continue;
            const unsub = f.value.subscribe(() => computeOptions());
            this.#dependencyUnsubs.push(unsub);
        }
    }
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Set a value on an object using a dot-notation path.
 * setNested({}, 'a.b.c', 1) → { a: { b: { c: 1 } } }
 */
function setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}
