<script>
    import { translate } from '../core/config.js';
    import InputField     from './fields/InputField.svelte';
    import PasswordField  from './fields/PasswordField.svelte';
    import DateField      from './fields/DateField.svelte';
    import DatetimeField  from './fields/DatetimeField.svelte';
    import TimeField      from './fields/TimeField.svelte';
    import TextareaField  from './fields/TextareaField.svelte';
    import SelectField    from './fields/SelectField.svelte';
    import Select2Field   from './fields/Select2Field.svelte';
    import RadioField     from './fields/RadioField.svelte';
    import CheckboxField  from './fields/CheckboxField.svelte';
    import Multiselect    from './fields/Multiselect.svelte';
    import Uploadfield    from './fields/Uploadfield.svelte';
    import DatepickerTz   from './fields/DatepickerTz.svelte';
    import CustomJsonForm from './fields/CustomJsonForm.svelte';

    let {
        inputfield,
        hidden = false,
        showLabels = true,
        tabindex = 0,
    } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());

    // ─── Error state (for wrapper only: CSS class + error message) ───────────
    let errors = $state([]);
    $effect(() => inputfield.errors.subscribe(e => { errors = e; }));

    // ─── Derived ─────────────────────────────────────────────────────────────
    let isRequired = $derived(
        typeof fielddef.validation === 'string'
            ? fielddef.validation.includes('required')
            : false
    );
    let firstError = $derived(errors.length > 0 ? translate(errors[0]) : '');
    let isValid    = $derived(errors.length === 0);
    let cssClass   = $derived([
        'fe-formfield',
        'type-' + inputfield.type,
        !isValid ? 'error' : '',
        fielddef.info ? 'has-info' : '',
    ].filter(Boolean).join(' '));

    // ─── Field type → component map ──────────────────────────────────────────
    const fieldComponents = {
        input:           InputField,
        password:        PasswordField,
        date:            DateField,
        datetime:        DatetimeField,
        time:            TimeField,
        text:            TextareaField,
        select:          SelectField,
        select2:         Select2Field,
        radio:           RadioField,
        checkbox:        CheckboxField,
        multiselect:     Multiselect,
        file:            Uploadfield,
        'datetime-tz':   DatepickerTz,
        json:            CustomJsonForm,
    };
</script>

<!-- ── Hidden field ──────────────────────────────────────────────────────── -->
{#if hidden}
    <input type="hidden" value={inputfield.value.get() ?? ''} />

<!-- ── Visible field ─────────────────────────────────────────────────────── -->
{:else}
    <div class={cssClass}>

        {#if fielddef.label && showLabels}
            <label for={inputfield.id} class:required={isRequired}>
                {translate(fielddef.label)}
                {#if fielddef.info}
                    <small class="fe-field-info">
                        {translate('popover_' + fielddef.info + '_copy')}
                    </small>
                {/if}
            </label>
        {/if}

        {#if inputfield.type === 'component' && fielddef.componentClass}
            {@const C = fielddef.componentClass}
            <C {inputfield} />
        {:else}
            {@const FieldComponent = fieldComponents[inputfield.type]}
            {#if FieldComponent}
                <FieldComponent {inputfield} {tabindex} />
            {/if}
        {/if}

        {#if firstError}
            <small class="fe-field-error" role="alert">{firstError}</small>
        {/if}

    </div>
{/if}

<style>
    .fe-formfield {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.75rem;
    }

    label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #333;
    }

    label.required::after {
        content: ' *';
        color: #dc3545;
    }

    .fe-field-info {
        display: block;
        font-weight: normal;
        font-size: 0.78rem;
        color: #777;
        margin-top: 0.1rem;
    }

    :global(.fe-formfield .fe-input) {
        width: 100%;
        padding: 0.375rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.9rem;
        line-height: 1.5;
        box-sizing: border-box;
        background: white;
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    :global(.fe-formfield .fe-input:focus) {
        border-color: #80bdff;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    }

    :global(.fe-formfield .fe-input[readonly]) {
        background: #f8f9fa;
        color: #6c757d;
        cursor: default;
    }

    :global(.fe-formfield.error .fe-input) {
        border-color: #dc3545;
    }

    :global(.fe-formfield .fe-select) {
        appearance: auto;
        cursor: pointer;
    }

    .fe-field-error {
        color: #dc3545;
        font-size: 0.8rem;
    }
</style>
