<script>
    import { Formfield } from '../src/svelte/index.js';

    let { form, onsubmit } = $props();

    let addressOpen = $state(false);
    let prefsOpen   = $state(false);
</script>

<!--
    Example: manually composed form using <Formfield> components.

    Instead of letting <GenericForm> handle the layout, we retrieve individual
    Inputfield instances via form.getInputfield() and place them wherever we
    want — enabling custom grid layouts, collapsible sections, conditional
    blocks, or any other structure that wouldn't fit the generic row/column model.
-->
<div class="custom-form">

    <!-- ── Section 1: always visible ─────────────────────────────────────── -->
    <section class="form-section">
        <h3 class="section-heading">Personal Information</h3>
        <div class="field-row">
            <Formfield inputfield={form.getInputfield('first_name')} />
            <Formfield inputfield={form.getInputfield('last_name')} />
        </div>
        <Formfield inputfield={form.getInputfield('email')} />
    </section>

    <!-- ── Section 2: collapsible ─────────────────────────────────────────── -->
    <section class="form-section collapsible">
        <button
            class="section-toggle"
            type="button"
            onclick={() => { addressOpen = !addressOpen; }}
            aria-expanded={addressOpen}
        >
            Address
            <span class="chevron" class:open={addressOpen}>▾</span>
        </button>

        {#if addressOpen}
            <div class="section-body">
                <Formfield inputfield={form.getInputfield('street')} />
                <div class="field-row narrow">
                    <Formfield inputfield={form.getInputfield('zip')} />
                    <Formfield inputfield={form.getInputfield('city')} />
                </div>
                <Formfield inputfield={form.getInputfield('country')} />
            </div>
        {/if}
    </section>

    <!-- ── Section 3: collapsible ─────────────────────────────────────────── -->
    <section class="form-section collapsible">
        <button
            class="section-toggle"
            type="button"
            onclick={() => { prefsOpen = !prefsOpen; }}
            aria-expanded={prefsOpen}
        >
            Notes & Website
            <span class="chevron" class:open={prefsOpen}>▾</span>
        </button>

        {#if prefsOpen}
            <div class="section-body">
                <Formfield inputfield={form.getInputfield('bio')} />
                <Formfield inputfield={form.getInputfield('website')} />
            </div>
        {/if}
    </section>

    <!-- ── Actions ────────────────────────────────────────────────────────── -->
    <div class="form-actions">
        <button
            class="btn-primary"
            type="button"
            onclick={() => { if (form.validate()) form.submit(); }}
        >
            Submit
        </button>
    </div>

</div>

<style>
    .custom-form {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    /* ── Sections ─────────────────────────────────────────────────────────── */

    .form-section {
        border-bottom: 1px solid #e9ecef;
        padding: 1.25rem 0;
    }

    .form-section:first-child { padding-top: 0; }
    .form-section:last-child  { border-bottom: none; }

    .section-heading {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6c757d;
        margin: 0 0 1rem;
    }

    /* ── Collapsible toggle ───────────────────────────────────────────────── */

    .section-toggle {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6c757d;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0;
        box-sizing: border-box;
    }

    .section-toggle:hover { color: #333; }

    .chevron {
        display: inline-block;
        font-style: normal;
        transition: transform 0.2s ease;
        transform: rotate(-90deg);
        font-size: 1rem;
        line-height: 1;
    }

    .chevron.open { transform: rotate(0deg); }

    .section-body { margin-top: 1rem; }

    /* ── Side-by-side field rows ──────────────────────────────────────────── */

    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .field-row.narrow {
        grid-template-columns: 6rem 1fr;
    }

    /* ── Actions ──────────────────────────────────────────────────────────── */

    .form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 1.25rem;
    }

    .btn-primary {
        padding: 0.5rem 1.25rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .btn-primary:hover { background: #0056b3; }
</style>
