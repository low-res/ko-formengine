<script>
    let { inputfield } = $props();

    let value = $state(null);

    $effect(() => inputfield.value.subscribe(v => { value = v; }));

    function setValue(v) { inputfield.value.set(v); }
    function onBlur() { inputfield.validateOnlyIfValue(); }
</script>

<textarea
    id={inputfield.id}
    class="fe-input fe-textarea"
    rows="4"
    readonly={inputfield.readonly || undefined}
    oninput={(e) => setValue(e.currentTarget.value)}
    onblur={onBlur}
>{value ?? ''}</textarea>

<style>
    .fe-textarea {
        resize: vertical;
        min-height: 80px;
    }
</style>
