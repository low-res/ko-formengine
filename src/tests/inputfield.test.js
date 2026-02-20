import { describe, it, expect } from 'vitest';
import Field from 'ko-fielddefinitions/field';
import { Inputfield } from '../core/Inputfield.js';

function makeField(config) {
    return new Field(config);
}

describe('Inputfield', () => {
    it('creates with default null value for input type', () => {
        const field = makeField({ name: 'test', type: 'input' });
        const input = new Inputfield(field);
        expect(input.value.get()).toBeNull();
    });

    it('reads initial value from source via valueAccessor', () => {
        const field = makeField({ name: 'username', type: 'input', valueAccessor: 'username' });
        const input = new Inputfield(field, { username: 'alice' });
        expect(input.value.get()).toBe('alice');
    });

    it('validate fails when required and empty (null value)', () => {
        const field = makeField({ name: 'email', type: 'input', validation: 'required' });
        const input = new Inputfield(field);
        expect(input.validate()).toBe(false);
        expect(input.errors.get().length).toBeGreaterThan(0);
    });

    it('validate passes when required and has value', () => {
        const field = makeField({ name: 'email', type: 'input', valueAccessor: 'email', validation: 'required' });
        const input = new Inputfield(field, { email: 'test@example.com' });
        expect(input.validate()).toBe(true);
        expect(input.errors.get()).toEqual([]);
    });

    it('isValid reflects error state', () => {
        const field = makeField({ name: 'x', type: 'input', validation: 'required' });
        const input = new Inputfield(field);
        input.validate();
        expect(input.isValid).toBe(false);
    });

    it('clear resets value to null', () => {
        const field = makeField({ name: 'x', type: 'input', valueAccessor: 'x' });
        const input = new Inputfield(field, { x: 'hello' });
        input.clear();
        expect(input.value.get()).toBeNull();
    });

    it('getFieldDefinition returns the field', () => {
        const field = makeField({ name: 'y', type: 'input' });
        const input = new Inputfield(field);
        expect(input.getFieldDefinition()).toBe(field);
    });

    it('options Signal created for select type', () => {
        const field = makeField({ name: 'sel', type: 'select', options: ['a', 'b'] });
        const input = new Inputfield(field);
        expect(input.options).toBeDefined();
        expect(Array.isArray(input.options.get())).toBe(true);
    });

    it('dispose cleans up without error', () => {
        const field = makeField({ name: 'z', type: 'input' });
        const input = new Inputfield(field);
        expect(() => input.dispose()).not.toThrow();
    });
});
