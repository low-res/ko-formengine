<script>
    import { unwrap } from 'ko-fielddefinitions/utils';
    import { getOptionValue, getOptionLabel } from '../fieldHelpers.js';

    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let value = $state([]);
    let options = $state([]);

    $effect(() => inputfield.value.subscribe(v => { value = Array.isArray(v) ? v : []; }));

    $effect(() => {
        if (inputfield.options) return inputfield.options.subscribe(o => { options = o; });
        options = unwrap(fielddef.options) ?? [];
    });

    function toggle(e, optVal) {
        const current = Array.isArray(value) ? [...value] : [];
        if (e.currentTarget.checked) {
            inputfield.value.set([...current, optVal]);
        } else {
            inputfield.value.set(current.filter(v => String(v) !== String(optVal)));
        }
    }

    function toggleAll() {
        const allVals = options.map(o => getOptionValue(o, fielddef, inputfield));
        inputfield.value.set(value.length === allVals.length ? [] : allVals);
    }
</script>

{#if fielddef.selectDeselectAll}
    <button type="button" class="fe-toggle-all-btn" onclick={toggleAll}>
        Toggle all
    </button>
{/if}

<div class="fe-checkbox-group">
    {#each options as option (getOptionValue(option, fielddef, inputfield))}
        {@const optVal = getOptionValue(option, fielddef, inputfield)}
        {@const inputId = inputfield.id + String(optVal)}
        <label class="fe-checkbox-label" for={inputId}>
            <input
                type="checkbox"
                id={inputId}
                name={inputfield.id}
                value={String(optVal)}
                checked={value.some(v => String(v) === String(optVal))}
                onchange={(e) => toggle(e, optVal)}
            />
            {getOptionLabel(option, fielddef, inputfield)}
        </label>
    {/each}
</div>

<style>
    .fe-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

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
</style>
