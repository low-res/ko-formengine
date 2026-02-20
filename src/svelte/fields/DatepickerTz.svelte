<script>
    import { untrack } from 'svelte';
    import { toZonedTime, fromZonedTime } from 'date-fns-tz';
    import { format, parseISO } from 'date-fns';
    import { translate } from '../../core/config.js';

    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let timezones = $derived(fielddef.timezones ?? ['UTC']);

    let dateInputId = $derived(inputfield.id + '_date');
    let tzInputId = $derived(inputfield.id + '_tz');

    // Parse the current JSON value
    function parseValue(raw) {
        if (!raw) return { date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), tz: 'UTC' };
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            const tz = parsed.tz || 'UTC';
            // Convert UTC date to the stored timezone for display
            const utcDate = new Date(parsed.date || new Date());
            const zonedDate = toZonedTime(utcDate, tz);
            return {
                date: format(zonedDate, "yyyy-MM-dd'T'HH:mm"),
                tz
            };
        } catch {
            return { date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), tz: 'UTC' };
        }
    }

    const initial = untrack(() => parseValue(inputfield.value.get()));
    let selectedTz = $state(initial.tz);
    let localDateStr = $state(initial.date);
    let tzErrors = $state([]);
    let dateErrors = $state([]);

    // Update the inputfield value whenever date or tz changes
    function updateValue() {
        if (!localDateStr || !selectedTz) return;
        try {
            const localDate = parseISO(localDateStr);
            const utcDate = fromZonedTime(localDate, selectedTz);
            inputfield.value.set(JSON.stringify({
                tz: selectedTz,
                date: utcDate.toISOString()
            }));
        } catch {
            // invalid date — don't update
        }
    }

    // Override the inputfield's validate method (one-time setup, inputfield is stable)
    untrack(() => {
        inputfield.validate = function () {
            const validation = fielddef.validation;
            tzErrors = [];
            dateErrors = [];

            let valid = true;

            if (validation) {
                if (!selectedTz) {
                    tzErrors = ['validation.required'];
                    valid = false;
                }
                if (!localDateStr) {
                    dateErrors = ['validation.required'];
                    valid = false;
                }
            }

            if (valid) updateValue();
            return valid;
        };
    });

    $effect(() => {
        updateValue();
    });
</script>

<div class="fe-datepicker-tz">
    <div class="fe-datepicker-tz-date">
        <label for={dateInputId}>{translate('datetime_tz.date_label') || 'Date & Time'}</label>
        <input
            id={dateInputId}
            type="datetime-local"
            class="fe-input"
            class:error={dateErrors.length > 0}
            bind:value={localDateStr}
            oninput={updateValue}
        />
        {#if dateErrors.length > 0}
            <small class="fe-error">{translate(dateErrors[0])}</small>
        {/if}
    </div>

    <div class="fe-datepicker-tz-zone">
        <label for={tzInputId}>{translate('datetime_tz.timezone_label') || 'Timezone'}</label>
        <select
            id={tzInputId}
            class="fe-select"
            class:error={tzErrors.length > 0}
            bind:value={selectedTz}
            onchange={updateValue}
        >
            {#each timezones as tz}
                <option value={tz}>{tz}</option>
            {/each}
        </select>
        {#if tzErrors.length > 0}
            <small class="fe-error">{translate(tzErrors[0])}</small>
        {/if}
    </div>
</div>

<style>
    .fe-datepicker-tz {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .fe-datepicker-tz-date {
        flex: 2;
        min-width: 200px;
    }

    .fe-datepicker-tz-zone {
        flex: 1;
        min-width: 150px;
    }

    label {
        display: block;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
    }

    .fe-input,
    .fe-select {
        width: 100%;
        padding: 0.375rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .fe-input.error,
    .fe-select.error {
        border-color: #dc3545;
    }

    .fe-error {
        color: #dc3545;
        font-size: 0.8rem;
    }
</style>
