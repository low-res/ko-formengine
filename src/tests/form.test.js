import { describe, it, expect, vi } from 'vitest';
import FieldsCollection from 'ko-fielddefinitions/fieldsCollection';
import { Form } from '../core/Form.js';

function makeFormRows(fieldsConfig) {
    const collection = new FieldsCollection({
        fields: fieldsConfig,
        collections: [{ name: 'all', fields: fieldsConfig.map(f => f.name) }]
    });
    return collection.getFormRows('all');
}

// Helper to add valueAccessor matching name so source reads work
function field(name, extra = {}) {
    return { name, valueAccessor: name, ...extra };
}

describe('Form', () => {
    it('creates inputfields from formRows', () => {
        const rows = makeFormRows([
            field('first', { type: 'input' }),
            field('last', { type: 'input' })
        ]);
        const form = new Form(rows);
        expect(form.inputfields.length).toBe(2);
        expect(form.getAllFieldnames()).toContain('first');
        expect(form.getAllFieldnames()).toContain('last');
    });

    it('populates values from source', () => {
        const rows = makeFormRows([field('city', { type: 'input' })]);
        const form = new Form(rows, { city: 'Vienna' });
        expect(form.getInputfield('city').value.get()).toBe('Vienna');
    });

    it('getValues returns current field values', () => {
        const rows = makeFormRows([
            field('a', { type: 'input' }),
            field('b', { type: 'input' })
        ]);
        const form = new Form(rows, { a: '1', b: '2' });
        const vals = form.getValues();
        expect(vals.a).toBe('1');
        expect(vals.b).toBe('2');
    });

    it('validate returns true when all fields valid', () => {
        const rows = makeFormRows([field('x', { type: 'input', validation: 'required' })]);
        const form = new Form(rows, { x: 'value' });
        expect(form.validate()).toBe(true);
    });

    it('validate returns false when required field is empty', () => {
        const rows = makeFormRows([field('req', { type: 'input', validation: 'required' })]);
        const form = new Form(rows);
        expect(form.validate()).toBe(false);
    });

    it('addSubmitHandler registers handler called on submit', () => {
        const rows = makeFormRows([field('n', { type: 'input' })]);
        const form = new Form(rows, { n: 'val' });
        const handler = vi.fn();
        form.addSubmitHandler(handler);
        form.submit();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ n: 'val' }));
    });

    it('addDismissHandler registers handler called on dismiss', () => {
        const rows = makeFormRows([field('m', { type: 'input' })]);
        const form = new Form(rows);
        const handler = vi.fn();
        form.addDismissHandler(handler);
        form.dismiss();
        expect(handler).toHaveBeenCalledOnce();
    });

    it('addSubmitHandler throws for non-functions', () => {
        const rows = makeFormRows([field('x', { type: 'input' })]);
        const form = new Form(rows);
        expect(() => form.addSubmitHandler('not-a-fn')).toThrow();
    });

    it('dependenedOptions updates inputfield options when dependency changes', () => {
        const rows = makeFormRows([
            field('type', { type: 'select', options: ['a', 'b'] }),
            field('sub', {
                type: 'select',
                options: [],
                dependenedOptions: function (form) {
                    const typeVal = form.getInputfield('type').value.get();
                    return typeVal === 'a' ? ['x', 'y'] : ['p', 'q'];
                }
            })
        ]);
        const form = new Form(rows, { type: 'a' });
        const subField = form.getInputfield('sub');
        expect(subField.options.get()).toEqual(['x', 'y']);

        form.getInputfield('type').value.set('b');
        expect(subField.options.get()).toEqual(['p', 'q']);
    });

    it('dispose cleans up without error', () => {
        const rows = makeFormRows([field('z', { type: 'input' })]);
        const form = new Form(rows);
        expect(() => form.dispose()).not.toThrow();
    });

    it('setSource updates field values', () => {
        const rows = makeFormRows([field('name', { type: 'input' })]);
        const form = new Form(rows, { name: 'old' });
        form.setSource({ name: 'new' });
        expect(form.getInputfield('name').value.get()).toBe('new');
    });
});
