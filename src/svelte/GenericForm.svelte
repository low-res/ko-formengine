<script>
    import Formfield from './Formfield.svelte';
    import { translate } from '../core/config.js';

    /**
     * @typedef {import('../core/Form.js').Form} Form
     */

    let {
        form,
        submitLabel = 'form_submit_label',
        cancelLabel = 'form_cancel_label',
        showButtons = true,
    } = $props();

    function handleSubmit() {
        const isValid = form.validate();
        if (isValid) {
            form.submit();
        } else {
            // Scroll to first error after Svelte updates the DOM
            setTimeout(() => {
                const firstError = document.querySelector('.fe-formfield.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
    }

    function handleCancel() {
        form.dismiss();
    }
</script>

<form class="fe-form" enctype="multipart/form-data" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    {#each form.formRows as row}
        <div class="fe-row">
            {#each row as cell}
                {#if cell.type === 'field' && cell.width === 'hidden'}
                    <Formfield inputfield={cell.inputfield} hidden={true} />

                {:else if cell.type === 'field'}
                    <div class="fe-col" style="flex: {cell.width ?? 1}">
                        <Formfield inputfield={cell.inputfield} />
                    </div>

                {:else if cell.type === 'divider'}
                    <div class="fe-divider fe-col-full">
                        <h2>{translate(cell.label ?? '')}</h2>
                    </div>
                {/if}
            {/each}
        </div>
    {/each}

    {#if showButtons}
        <div class="fe-row fe-buttons">
            {#if form.dismissHandlers.length > 0}
                <button type="button" class="fe-btn fe-btn-cancel" onclick={handleCancel}>
                    {translate(cancelLabel)}
                </button>
            {/if}
            <button type="submit" class="fe-btn fe-btn-submit">
                {translate(submitLabel)}
            </button>
        </div>
    {/if}
</form>

<style>
    .fe-form {
        width: 100%;
    }

    .fe-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .fe-col {
        flex: 1;
        min-width: 0;
    }

    .fe-col-full {
        flex: 0 0 100%;
    }

    .fe-divider {
        border-bottom: 1px solid #ddd;
        margin: 1rem 0 0.5rem;
    }

    .fe-divider h2 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
        color: #555;
    }

    .fe-buttons {
        justify-content: flex-end;
        margin-top: 1.5rem;
        gap: 0.5rem;
    }

    .fe-btn {
        padding: 0.5rem 1.25rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .fe-btn-submit {
        background: #007bff;
        color: white;
    }

    .fe-btn-submit:hover {
        background: #0056b3;
    }

    .fe-btn-cancel {
        background: #6c757d;
        color: white;
    }

    .fe-btn-cancel:hover {
        background: #545b62;
    }
</style>
