<script>
    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let value = $state(null);

    $effect(() => inputfield.value.subscribe(v => { value = v; }));

    function setValue(v) { inputfield.value.set(v); }
    function onBlur() { inputfield.validateOnlyIfValue(); }
</script>

<input
    id={inputfield.id}
    class="fe-input"
    type="datetime-local"
    value={value ?? ''}
    min={fielddef.minDate ?? undefined}
    max={fielddef.maxDate ?? undefined}
    readonly={inputfield.readonly || undefined}
    oninput={(e) => setValue(e.currentTarget.value)}
    onblur={onBlur}
/>
