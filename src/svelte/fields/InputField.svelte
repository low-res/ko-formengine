<script>
    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let value = $state(null);

    $effect(() => inputfield.value.subscribe(v => { value = v; }));

    function setValue(v) { inputfield.value.set(v); }
    function onBlur() { inputfield.validateOnlyIfValue(); }

    // ─── Inputmask action ─────────────────────────────────────────────────────

    function inputmask(node) {
        const mask = fielddef.mask;
        const maskSlots = fielddef.mask_slots;
        const maskAccept = fielddef.mask_accept;
        if (!mask || !maskSlots || !maskAccept) return {};

        const slots = new Set(maskSlots);
        const prev = (j => Array.from(mask, (c, i) => slots.has(c) ? (j = i + 1) : j))(0);
        const first = [...mask].findIndex(c => slots.has(c));
        const accept = new RegExp(maskAccept, 'g');

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

<input
    id={inputfield.id}
    class="fe-input"
    type={inputfield.keyboardtype}
    value={value ?? ''}
    placeholder={fielddef.placeholder ?? ''}
    readonly={inputfield.readonly || undefined}
    oninput={(e) => setValue(e.currentTarget.value)}
    onblur={onBlur}
    use:inputmask
/>
