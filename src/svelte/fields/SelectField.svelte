<script>
    import { translate } from '../../core/config.js';
    import { unwrap } from 'ko-fielddefinitions/utils';
    import { getOptionValue, getOptionLabel } from '../fieldHelpers.js';

    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let value = $state(null);
    let options = $state([]);

    $effect(() => inputfield.value.subscribe(v => { value = v; }));

    $effect(() => {
        if (inputfield.options) return inputfield.options.subscribe(o => { options = o; });
        options = unwrap(fielddef.options) ?? [];
    });

    function onSingleChange(e) {
        if (e.currentTarget.value === '') {
            inputfield.value.set(null);
        } else {
            const opt = options.find(o => String(getOptionValue(o, fielddef, inputfield)) === e.currentTarget.value);
            inputfield.value.set(fielddef.optionsValue
                ? getOptionValue(opt ?? e.currentTarget.value, fielddef, inputfield)
                : (opt ?? e.currentTarget.value));
        }
    }

    function onMultiChange(e) {
        const selected = Array.from(e.currentTarget.selectedOptions).map(o => o.value);
        inputfield.value.set(selected);
    }
</script>

{#if inputfield.selectMultiple}
    <!-- Multiple select -->
    <select
        id={inputfield.id}
        class="fe-input fe-select"
        multiple
        size={inputfield.selectSize}
        onchange={onMultiChange}
    >
        {#each options as option (getOptionValue(option, fielddef, inputfield))}
            <option
                value={String(getOptionValue(option, fielddef, inputfield))}
                selected={Array.isArray(value) && value.some(v => String(v) === String(getOptionValue(option, fielddef, inputfield)))}
            >
                {getOptionLabel(option, fielddef, inputfield)}
            </option>
        {/each}
    </select>
{:else}
    <!-- Single select -->
    <select
        id={inputfield.id}
        class="fe-input fe-select"
        onchange={onSingleChange}
    >
        {#if fielddef.optionscaption}
            <option value="" selected={value == null || value === ''}>
                {translate(fielddef.optionscaption)}
            </option>
        {/if}
        {#each options as option (getOptionValue(option, fielddef, inputfield))}
            <option
                value={String(getOptionValue(option, fielddef, inputfield))}
                selected={String(getOptionValue(option, fielddef, inputfield)) === String(value)}
            >
                {getOptionLabel(option, fielddef, inputfield)}
            </option>
        {/each}
    </select>
{/if}

<style>
    .fe-select {
        appearance: auto;
        cursor: pointer;
    }
</style>
