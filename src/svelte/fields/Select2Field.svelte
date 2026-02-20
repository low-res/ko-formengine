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

    function onChange(e) {
        if (e.currentTarget.value === '') {
            inputfield.value.set(null);
        } else {
            const opt = options.find(o => String(getOptionValue(o, fielddef, inputfield)) === e.currentTarget.value);
            inputfield.value.set(fielddef.optionsValue
                ? getOptionValue(opt ?? e.currentTarget.value, fielddef, inputfield)
                : (opt ?? e.currentTarget.value));
        }
    }
</script>

<select
    id={inputfield.id}
    class="fe-input fe-select"
    onchange={onChange}
>
    <option value="" selected={value == null || value === ''}>
        {translate(fielddef.optionscaption ?? 'general.optionscaption')}
    </option>
    {#each options as option (getOptionValue(option, fielddef, inputfield))}
        <option
            value={String(getOptionValue(option, fielddef, inputfield))}
            selected={String(getOptionValue(option, fielddef, inputfield)) === String(value)}
        >
            {getOptionLabel(option, fielddef, inputfield)}
        </option>
    {/each}
</select>

<style>
    .fe-select {
        appearance: auto;
        cursor: pointer;
    }
</style>
