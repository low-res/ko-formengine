<script>
    import { translate } from '../../core/config.js';
    import { unwrap } from 'ko-fielddefinitions/utils';
    import { getOptionValue, getOptionLabel } from '../fieldHelpers.js';

    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let listboxId = $derived(inputfield.id + '_listbox');

    // ─── Options ─────────────────────────────────────────────────────────────

    /** @type {any[]} */
    let allOptions = $state([]);

    $effect(() => {
        if (!inputfield.options) {
            allOptions = unwrap(fielddef.options) ?? [];
            return;
        }
        return inputfield.options.subscribe(opts => { allOptions = opts; });
    });

    // ─── Selection state ─────────────────────────────────────────────────────

    /** @type {any[]} */
    let selection = $state([]);
    let searchterm = $state('');
    let isOpen = $state(false);
    let highlightedIndex = $state(-1);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const optVal = (o) => getOptionValue(o, fielddef, inputfield);
    const optLabel = (o) => getOptionLabel(o, fielddef, inputfield);

    // ─── Filtered options (exclude already selected) ─────────────────────────

    let filteredOptions = $derived.by(() => {
        const term = searchterm.toLowerCase();
        return allOptions.filter(option => {
            const isSelected = selection.some(s => optVal(s) === optVal(option));
            if (isSelected) return false;
            if (!term) return true;
            return optLabel(option).toLowerCase().includes(term);
        });
    });

    // ─── Sync selection → inputfield.value ───────────────────────────────────

    let selfUpdating = false;

    function pushToInputfield() {
        selfUpdating = true;
        inputfield.value.set(selection.map(optVal));
        selfUpdating = false;
    }

    // ─── Sync inputfield.value → selection (external changes) ────────────────

    $effect(() => {
        return inputfield.value.subscribe(newValues => {
            if (selfUpdating) return;
            if (!Array.isArray(newValues)) return;

            const opts = allOptions;
            const newSelection = newValues
                .map(v => opts.find(o => optVal(o) === v))
                .filter(Boolean);

            selection = newSelection;
        });
    });

    // ─── Override inputfield.clear to also reset local selection ─────────────

    $effect(() => {
        const originalClear = inputfield.clear.bind(inputfield);
        inputfield.clear = function () {
            selection = [];
            originalClear();
        };
        return () => {
            inputfield.clear = originalClear;
        };
    });

    // ─── Interaction ─────────────────────────────────────────────────────────

    function selectOption(option) {
        selection = [...selection, option];
        pushToInputfield();
        searchterm = '';
    }

    function unselectOption(option) {
        selection = selection.filter(s => optVal(s) !== optVal(option));
        pushToInputfield();
    }

    function selectAll() {
        selection = [...allOptions];
        pushToInputfield();
    }

    function removeAll() {
        selection = [];
        pushToInputfield();
    }

    function open() {
        isOpen = true;
        highlightedIndex = -1;
    }

    function close() {
        isOpen = false;
        searchterm = '';
        highlightedIndex = -1;
    }

    function handleKeydown(e) {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') { open(); e.preventDefault(); }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
                e.preventDefault();
                break;
            case 'ArrowUp':
                highlightedIndex = Math.max(highlightedIndex - 1, 0);
                e.preventDefault();
                break;
            case 'Enter':
                if (highlightedIndex >= 0) selectOption(filteredOptions[highlightedIndex]);
                e.preventDefault();
                break;
            case 'Escape':
                close();
                e.preventDefault();
                break;
        }
    }

    function handleClickOutside(node) {
        function onClick(e) {
            if (!node.contains(e.target)) close();
        }
        document.addEventListener('click', onClick, true);
        return { destroy: () => document.removeEventListener('click', onClick, true) };
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fe-multiselect" class:open={isOpen} use:handleClickOutside>
    <!-- Selected tags + search input -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fe-ms-box" onclick={open} onkeydown={handleKeydown} role="combobox" aria-expanded={isOpen} aria-controls={listboxId} tabindex="0">
        <ul class="fe-ms-tags">
            {#each selection as option (optVal(option))}
                <li class="fe-ms-tag">
                    <span>{optLabel(option)}</span>
                    <button
                        type="button"
                        class="fe-ms-tag-remove"
                        onclick={(e) => { e.stopPropagation(); unselectOption(option); }}
                        aria-label="Remove {optLabel(option)}"
                    >✕</button>
                </li>
            {/each}

            <li class="fe-ms-search">
                <input
                    type="search"
                    bind:value={searchterm}
                    onfocus={open}
                    onkeydown={handleKeydown}
                    placeholder={selection.length === 0 ? translate('general.optionscaption') : ''}
                    autocomplete="off"
                />
            </li>
        </ul>
    </div>

    <!-- Dropdown -->
    {#if isOpen}
        <div class="fe-ms-dropdown">
            <div class="fe-ms-actions">
                <button type="button" onclick={selectAll}>{translate('multiselect.selectall') || 'Select all'}</button>
                <button type="button" onclick={removeAll}>{translate('multiselect.removeall') || 'Remove all'}</button>
            </div>

            <ul class="fe-ms-options" id={listboxId} role="listbox">
                {#each filteredOptions as option, i (optVal(option))}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <li
                        class="fe-ms-option"
                        class:highlighted={i === highlightedIndex}
                        onclick={() => selectOption(option)}
                        role="option"
                        aria-selected={false}
                    >
                        {optLabel(option)}
                    </li>
                {/each}

                {#if filteredOptions.length === 0}
                    <li class="fe-ms-empty">{translate('multiselect.nooptions') || 'No options'}</li>
                {/if}
            </ul>
        </div>
    {/if}
</div>

<style>
    .fe-multiselect {
        position: relative;
        width: 100%;
    }

    .fe-ms-box {
        min-height: 38px;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 0.25rem;
        cursor: text;
        background: white;
        display: flex;
        align-items: flex-start;
    }

    .fe-multiselect.open .fe-ms-box {
        border-color: #80bdff;
        box-shadow: 0 0 0 3px rgba(0,123,255,.2);
        outline: none;
    }

    .fe-ms-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        list-style: none;
        margin: 0;
        padding: 0;
        flex: 1;
    }

    .fe-ms-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: #e9ecef;
        border-radius: 3px;
        padding: 0.15rem 0.4rem;
        font-size: 0.85rem;
    }

    .fe-ms-tag-remove {
        border: none;
        background: none;
        cursor: pointer;
        padding: 0;
        font-size: 0.75rem;
        line-height: 1;
        color: #666;
    }

    .fe-ms-tag-remove:hover {
        color: #dc3545;
    }

    .fe-ms-search {
        flex: 1;
        min-width: 80px;
        list-style: none;
    }

    .fe-ms-search input {
        border: none;
        outline: none;
        width: 100%;
        padding: 0.15rem 0.25rem;
        font-size: 0.9rem;
        background: transparent;
    }

    .fe-ms-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        max-height: 240px;
        display: flex;
        flex-direction: column;
    }

    .fe-ms-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.4rem 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .fe-ms-actions button {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.8rem;
        color: #007bff;
        padding: 0;
    }

    .fe-ms-actions button:hover {
        text-decoration: underline;
    }

    .fe-ms-options {
        overflow-y: auto;
        flex: 1;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .fe-ms-option {
        padding: 0.4rem 0.75rem;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .fe-ms-option:hover,
    .fe-ms-option.highlighted {
        background: #f0f4ff;
    }

    .fe-ms-empty {
        padding: 0.5rem 0.75rem;
        color: #999;
        font-size: 0.85rem;
        list-style: none;
    }
</style>
