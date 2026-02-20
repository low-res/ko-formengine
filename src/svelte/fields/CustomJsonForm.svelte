<script>
    import { untrack } from 'svelte';
    import FieldsCollection from 'ko-fielddefinitions/fieldsCollection';
    import { Form } from '../../core/Form.js';
    import Formfield from '../Formfield.svelte';

    let { inputfield } = $props();

    // fielddef and subForm are stable after init — inputfield prop doesn't change
    const fielddef = untrack(() => inputfield.getFieldDefinition());

    if (!fielddef.fields) {
        console.error("CustomJsonForm: field definition must have a 'fields' array");
    }

    // Build a FieldsCollection from the nested field definitions
    const collection = new FieldsCollection({
        fields: fielddef.fields ?? [],
        collections: [
            { name: 'all', fields: (fielddef.fields ?? []).map(f => f.name) }
        ]
    });

    // Parse the current JSON value as source for the sub-form
    function parseSource() {
        try {
            const raw = inputfield.value.get();
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    const subForm = new Form(collection.getFormRows('all'), parseSource());

    // Subscribe to all sub-field value changes → update parent JSON
    for (const fieldname of subForm.getAllFieldnames()) {
        const subField = subForm.getInputfield(fieldname);
        if (subField) {
            subField.value.subscribe(() => {
                const values = subForm.getValues();
                inputfield.value.set(JSON.stringify(values));
            });
        }
    }

    // Override the parent inputfield's validate to validate the sub-form
    untrack(() => {
        inputfield.validate = function () {
            return subForm.validate();
        };
    });
</script>

<div class="fe-json-form">
    {#each subForm.formRows as row}
        <div class="fe-json-row">
            {#each row as cell}
                {#if cell.type === 'field'}
                    <div class="fe-json-col">
                        <Formfield inputfield={cell.inputfield} />
                    </div>
                {/if}
            {/each}
        </div>
    {/each}
</div>

<style>
    .fe-json-form {
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0.75rem;
        background: #fafafa;
    }

    .fe-json-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .fe-json-col {
        flex: 1;
        min-width: 0;
    }
</style>
