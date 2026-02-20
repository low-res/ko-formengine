<script>
    import { translate } from '../core/config.js';
    import { unwrap } from 'ko-fielddefinitions/utils';
    import Uploadfield from './fields/Uploadfield.svelte';
    import DatepickerTz from './fields/DatepickerTz.svelte';
    import Multiselect from './fields/Multiselect.svelte';
    import CustomJsonForm from './fields/CustomJsonForm.svelte';

    let {
        inputfield,
        hidden = false,
        showLabels = true,
        tabindex = 0,
    } = $props();

    // fielddef as derived so it stays in sync if inputfield prop changes
    let fielddef = $derived(inputfield.getFieldDefinition());

    // ─── Reactive mirrors of Signal values ───────────────────────────────────
    // Initialized with defaults; $effect subscriptions immediately update them
    // (our Signal.subscribe() calls back synchronously with current value).
    // This pattern is correct for bridging external reactive state to Svelte.

    let value = $state(null);
    let errors = $state([]);
    let options = $state([]);

    $effect(() => {
        const u1 = inputfield.value.subscribe(v => { value = v; });
        const u2 = inputfield.errors.subscribe(e => { errors = e; });
        return () => { u1(); u2(); };
    });

    $effect(() => {
        if (inputfield.options) {
            return inputfield.options.subscribe(opts => { options = opts; });
        } else {
            options = unwrap(inputfield.getFieldDefinition().options) ?? [];
        }
    });

    // ─── Derived ──────────────────────────────────────────────────────────────

    let isRequired = $derived(
        typeof fielddef.validation === 'string'
            ? fielddef.validation.includes('required')
            : false
    );
    let firstError = $derived(errors.length > 0 ? translate(errors[0]) : '');
    let isValid = $derived(errors.length === 0);
    let cssClass = $derived([
        'fe-formfield',
        'type-' + inputfield.type,
        !isValid ? 'error' : '',
        fielddef.info ? 'has-info' : '',
    ].filter(Boolean).join(' '));

    // ─── Value helpers ────────────────────────────────────────────────────────

    function setValue(newValue) {
        inputfield.value.set(newValue);
    }

    function onBlur() {
        inputfield.validateOnlyIfValue();
    }

    // ─── Options helpers ──────────────────────────────────────────────────────

    function getOptionValue(option) {
        const optionsValue = fielddef.optionsValue;
        if (!optionsValue) return option;
        if (typeof optionsValue === 'string') return unwrap(option[optionsValue]);
        if (typeof optionsValue === 'function') return optionsValue(option, inputfield);
        return option;
    }

    function getOptionLabel(option) {
        const optionsText = fielddef.optionsText;
        const labelprefix = fielddef.labelprefix ?? '';
        if (optionsText) {
            if (typeof optionsText === 'string') return unwrap(option[optionsText]) ?? '';
            if (typeof optionsText === 'function') return optionsText(option, inputfield);
        }
        return translate(labelprefix + String(option));
    }

    function calculateInputId(optionValue) {
        return inputfield.id + String(optionValue);
    }

    // ─── Inputmask action ─────────────────────────────────────────────────────

    function inputmask(node) {
        const mask = fielddef.mask;
        const maskSlots = fielddef.mask_slots;
        const maskAccept = fielddef.mask_accept;
        if (!mask || !maskSlots || !maskAccept) return {};

        const slots = new Set(maskSlots || '_');
        const prev = (j => Array.from(mask, (c, i) => slots.has(c) ? (j = i + 1) : j))(0);
        const first = [...mask].findIndex(c => slots.has(c));
        const accept = new RegExp(maskAccept || '\\d', 'g');

        const clean = (input) => {
            input = input.match(accept) || [];
            return Array.from(mask, c =>
                input[0] === c || slots.has(c) ? input.shift() || c : c
            );
        };

        let back = false;
        const format = () => {
            const [i, j] = [node.selectionStart, node.selectionEnd].map(pos => {
                pos = clean((value?.slice(0, pos)) ?? '').findIndex(c => slots.has(c));
                return pos < 0 ? prev[prev.length - 1] : back ? prev[pos - 1] || first : pos;
            });
            setValue(clean(value ?? '').join(''));
            node.setSelectionRange(i, j);
            back = false;
        };

        const onKeydown = (e) => { back = e.key === 'Backspace'; };
        const onInput = () => format();
        const onFocus = () => format();
        const onBlurMask = () => { if (value === mask) setValue(''); };

        node.addEventListener('keydown', onKeydown);
        node.addEventListener('input', onInput);
        node.addEventListener('focus', onFocus);
        node.addEventListener('blur', onBlurMask);

        return {
            destroy() {
                node.removeEventListener('keydown', onKeydown);
                node.removeEventListener('input', onInput);
                node.removeEventListener('focus', onFocus);
                node.removeEventListener('blur', onBlurMask);
            }
        };
    }
</script>

<!-- ── Hidden field ─────────────────────────────────────────────────────── -->
{#if hidden}
    <input type="hidden" value={value ?? ''} />

<!-- ── Visible field ───────────────────────────────────────────────────── -->
{:else}
    <div class={cssClass}>

        <!-- Label -->
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

        <!-- ── input ──────────────────────────────────────────────────────── -->
        {#if inputfield.type === 'input'}
            <input
                id={inputfield.id}
                class="fe-input"
                type={inputfield.keyboardtype}
                value={value ?? ''}
                placeholder={fielddef.placeholder ?? ''}
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
                use:inputmask
            />

        <!-- ── password ──────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'password'}
            <input
                id={inputfield.id}
                class="fe-input"
                type="password"
                value={value ?? ''}
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
            />

        <!-- ── date ──────────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'date'}
            <input
                id={inputfield.id}
                class="fe-input"
                type="date"
                value={value ?? ''}
                min={fielddef.minDate ?? undefined}
                max={fielddef.maxDate ?? undefined}
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
            />

        <!-- ── datetime ──────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'datetime'}
            <input
                id={inputfield.id}
                class="fe-input"
                type="datetime-local"
                value={value ?? ''}
                min={fielddef.minDate ?? undefined}
                max={fielddef.maxDate ?? undefined}
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
            />

        <!-- ── time ──────────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'time'}
            <input
                id={inputfield.id}
                class="fe-input"
                type="time"
                value={value ?? ''}
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
            />

        <!-- ── textarea ──────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'text'}
            <textarea
                id={inputfield.id}
                class="fe-input fe-textarea"
                rows="4"
                readonly={inputfield.readonly || undefined}
                {tabindex}
                oninput={(e) => setValue(e.currentTarget.value)}
                onblur={onBlur}
            >{value ?? ''}</textarea>

        <!-- ── select (single) ───────────────────────────────────────────── -->
        {:else if inputfield.type === 'select' && !inputfield.selectMultiple}
            <select
                id={inputfield.id}
                class="fe-input fe-select"
                {tabindex}
                onchange={(e) => {
                    if (e.currentTarget.value === '') {
                        setValue(null);
                    } else {
                        const opt = options.find(o => String(getOptionValue(o)) === e.currentTarget.value);
                        setValue(fielddef.optionsValue ? getOptionValue(opt ?? e.currentTarget.value) : (opt ?? e.currentTarget.value));
                    }
                }}
            >
                {#if fielddef.optionscaption}
                    <option value="" disabled selected={value == null || value === ''}>
                        {translate(fielddef.optionscaption)}
                    </option>
                {/if}
                {#each options as option (getOptionValue(option))}
                    <option
                        value={String(getOptionValue(option))}
                        selected={String(getOptionValue(option)) === String(value)}
                    >
                        {getOptionLabel(option)}
                    </option>
                {/each}
            </select>

        <!-- ── select (multiple) ─────────────────────────────────────────── -->
        {:else if inputfield.type === 'select' && inputfield.selectMultiple}
            <select
                id={inputfield.id}
                class="fe-input fe-select"
                multiple
                size={inputfield.selectSize}
                {tabindex}
                onchange={(e) => {
                    const selected = Array.from(e.currentTarget.selectedOptions).map(o => o.value);
                    setValue(selected);
                }}
            >
                {#each options as option (getOptionValue(option))}
                    <option
                        value={String(getOptionValue(option))}
                        selected={Array.isArray(value) && value.some(v => String(v) === String(getOptionValue(option)))}
                    >
                        {getOptionLabel(option)}
                    </option>
                {/each}
            </select>

        <!-- ── select2 (searchable single select) ────────────────────────── -->
        {:else if inputfield.type === 'select2'}
            <select
                id={inputfield.id}
                class="fe-input fe-select"
                {tabindex}
                onchange={(e) => {
                    if (e.currentTarget.value === '') {
                        setValue(null);
                    } else {
                        const opt = options.find(o => String(getOptionValue(o)) === e.currentTarget.value);
                        setValue(fielddef.optionsValue ? getOptionValue(opt ?? e.currentTarget.value) : (opt ?? e.currentTarget.value));
                    }
                }}
            >
                <option value="" selected={value == null || value === ''}>
                    {translate(fielddef.optionscaption ?? 'general.optionscaption')}
                </option>
                {#each options as option (getOptionValue(option))}
                    <option
                        value={String(getOptionValue(option))}
                        selected={String(getOptionValue(option)) === String(value)}
                    >
                        {getOptionLabel(option)}
                    </option>
                {/each}
            </select>

        <!-- ── radio ─────────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'radio'}
            <div class="fe-radio-group" role="radiogroup">
                {#each options as option (getOptionValue(option))}
                    {@const optVal = getOptionValue(option)}
                    {@const inputId = calculateInputId(optVal)}
                    <label class="fe-radio-label" for={inputId}>
                        <input
                            type="radio"
                            id={inputId}
                            name={inputfield.id}
                            value={String(optVal)}
                            checked={String(value) === String(optVal)}
                            {tabindex}
                            onchange={() => setValue(optVal)}
                        />
                        {getOptionLabel(option)}
                    </label>
                {/each}
            </div>

        <!-- ── checkbox ──────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'checkbox'}
            {#if fielddef.selectDeselectAll}
                <button type="button" class="fe-toggle-all-btn" onclick={() => {
                    const allVals = options.map(getOptionValue);
                    const current = Array.isArray(value) ? value : [];
                    setValue(current.length === allVals.length ? [] : allVals);
                }}>
                    Toggle all
                </button>
            {/if}
            <div class="fe-checkbox-group">
                {#each options as option (getOptionValue(option))}
                    {@const optVal = getOptionValue(option)}
                    {@const inputId = calculateInputId(optVal)}
                    <label class="fe-checkbox-label" for={inputId}>
                        <input
                            type="checkbox"
                            id={inputId}
                            name={inputfield.id}
                            value={String(optVal)}
                            checked={Array.isArray(value) && value.some(v => String(v) === String(optVal))}
                            {tabindex}
                            onchange={(e) => {
                                const current = Array.isArray(value) ? [...value] : [];
                                if (e.currentTarget.checked) {
                                    setValue([...current, optVal]);
                                } else {
                                    setValue(current.filter(v => String(v) !== String(optVal)));
                                }
                            }}
                        />
                        {getOptionLabel(option)}
                    </label>
                {/each}
            </div>

        <!-- ── file upload ────────────────────────────────────────────────── -->
        {:else if inputfield.type === 'file'}
            <Uploadfield {inputfield} />

        <!-- ── datetime with timezone ────────────────────────────────────── -->
        {:else if inputfield.type === 'datetime-tz'}
            <DatepickerTz {inputfield} />

        <!-- ── multiselect ───────────────────────────────────────────────── -->
        {:else if inputfield.type === 'multiselect'}
            <Multiselect {inputfield} />

        <!-- ── nested JSON form ──────────────────────────────────────────── -->
        {:else if inputfield.type === 'json'}
            <CustomJsonForm {inputfield} />

        <!-- ── custom Svelte component ───────────────────────────────────── -->
        {:else if inputfield.type === 'component' && fielddef.componentClass}
            {@const DynamicComponent = fielddef.componentClass}
            <DynamicComponent {inputfield} />
        {/if}

        <!-- Error message -->
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

    .fe-input {
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

    .fe-input:focus {
        border-color: #80bdff;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    }

    .fe-input[readonly] {
        background: #f8f9fa;
        color: #6c757d;
        cursor: default;
    }

    .fe-formfield.error .fe-input {
        border-color: #dc3545;
    }

    .fe-textarea {
        resize: vertical;
        min-height: 80px;
    }

    .fe-select {
        appearance: auto;
        cursor: pointer;
    }

    .fe-radio-group,
    .fe-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .fe-radio-label,
    .fe-checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: normal;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .fe-toggle-all-btn {
        border: none;
        background: none;
        cursor: pointer;
        color: #007bff;
        font-size: 0.85rem;
        padding: 0;
        margin-bottom: 0.25rem;
        text-decoration: underline;
    }

    .fe-field-error {
        color: #dc3545;
        font-size: 0.8rem;
    }
</style>
