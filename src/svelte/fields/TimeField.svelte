<script>
    let { inputfield } = $props();

    let value = $state(null);

    $effect(() => inputfield.value.subscribe(v => { value = v; }));

    function setValue(v) { inputfield.value.set(v); }
    function onBlur() { inputfield.validateOnlyIfValue(); }
</script>

<input
    id={inputfield.id}
    class="fe-input"
    type="time"
    value={value ?? ''}
    readonly={inputfield.readonly || undefined}
    oninput={(e) => setValue(e.currentTarget.value)}
    onblur={onBlur}
/>
