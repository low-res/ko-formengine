<script>
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
</script>

<div class="fe-radio-group" role="radiogroup">
    {#each options as option (getOptionValue(option, fielddef, inputfield))}
        {@const optVal = getOptionValue(option, fielddef, inputfield)}
        {@const inputId = inputfield.id + String(optVal)}
        <label class="fe-radio-label" for={inputId}>
            <input
                type="radio"
                id={inputId}
                name={inputfield.id}
                value={String(optVal)}
                checked={String(value) === String(optVal)}
                onchange={() => inputfield.value.set(optVal)}
            />
            {getOptionLabel(option, fielddef, inputfield)}
        </label>
    {/each}
</div>

<style>
    .fe-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .fe-radio-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: normal;
        cursor: pointer;
        font-size: 0.9rem;
    }
</style>
