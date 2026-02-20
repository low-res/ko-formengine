import { describe, it, expect, vi } from 'vitest';
import { Signal, ArraySignal } from '../core/Signal.js';

describe('Signal', () => {
    it('returns initial value', () => {
        const s = new Signal(42);
        expect(s.get()).toBe(42);
    });

    it('set updates value', () => {
        const s = new Signal(0);
        s.set(5);
        expect(s.get()).toBe(5);
    });

    it('update applies function', () => {
        const s = new Signal(2);
        s.update(v => v * 3);
        expect(s.get()).toBe(6);
    });

    it('subscribe calls fn immediately with current value', () => {
        const s = new Signal('hello');
        const fn = vi.fn();
        s.subscribe(fn);
        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith('hello');
    });

    it('subscribe calls fn on each change', () => {
        const s = new Signal(0);
        const fn = vi.fn();
        s.subscribe(fn);
        s.set(1);
        s.set(2);
        expect(fn).toHaveBeenCalledTimes(3); // immediate + 2 updates
        expect(fn).toHaveBeenLastCalledWith(2);
    });

    it('unsubscribe stops notifications', () => {
        const s = new Signal(0);
        const fn = vi.fn();
        const unsub = s.subscribe(fn);
        fn.mockClear();
        unsub();
        s.set(99);
        expect(fn).not.toHaveBeenCalled();
    });
});

describe('ArraySignal', () => {
    it('initializes with empty array by default', () => {
        const s = new ArraySignal();
        expect(s.get()).toEqual([]);
    });

    it('push appends item', () => {
        const s = new ArraySignal([1, 2]);
        s.push(3);
        expect(s.get()).toEqual([1, 2, 3]);
    });

    it('remove filters item by reference', () => {
        const s = new ArraySignal([1, 2, 3]);
        s.remove(2);
        expect(s.get()).toEqual([1, 3]);
    });

    it('clear empties array', () => {
        const s = new ArraySignal([1, 2, 3]);
        s.clear();
        expect(s.get()).toEqual([]);
    });
});
