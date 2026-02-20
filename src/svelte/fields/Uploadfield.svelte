<script>
    /**
     * File upload field component.
     * Bridges the native file input with the Inputfield model.
     */

    let { inputfield } = $props();

    let fielddef = $derived(inputfield.getFieldDefinition());
    let uniqueId = $derived('upload_' + inputfield.id);
    let multiple = $derived(fielddef.multiple ?? false);

    let filelist = $state('');

    function getFileInput() {
        return document.getElementById(uniqueId);
    }

    function triggerFilePicker() {
        getFileInput()?.click();
    }

    function onFileChange() {
        const input = getFileInput();
        if (!input) return;
        const files = input.files;
        inputfield.value.set(files);
        filelist = files ? Array.from(files).map(f => f.name).join(', ') : '';
    }

    function removeFiles() {
        const input = getFileInput();
        if (input) {
            input.value = '';
            inputfield.value.set(null);
            filelist = '';
        }
    }
</script>

<div class="fe-upload">
    <!-- Hidden native file input -->
    <input
        type="file"
        id={uniqueId}
        name={uniqueId}
        {multiple}
        style="display: none"
        onchange={onFileChange}
    />

    {#if filelist}
        <span class="fe-upload-filename">{filelist}</span>
        <button type="button" class="fe-upload-btn fe-upload-remove" onclick={removeFiles}>
            ✕ Remove
        </button>
    {:else}
        <button type="button" class="fe-upload-btn fe-upload-add" onclick={triggerFilePicker}>
            + Choose file{multiple ? 's' : ''}
        </button>
    {/if}
</div>

<style>
    .fe-upload {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .fe-upload-filename {
        font-size: 0.875rem;
        color: #555;
    }

    .fe-upload-btn {
        padding: 0.35rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 0.85rem;
    }

    .fe-upload-btn:hover {
        background: #f5f5f5;
    }

    .fe-upload-remove {
        color: #dc3545;
        border-color: #dc3545;
    }
</style>
