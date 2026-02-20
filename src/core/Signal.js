/**
 * Minimal reactive Signal / Observable.
 *
 * Framework-agnostic. Compatible with the Svelte store contract
 * (subscribe receives current value immediately, returns unsubscribe fn).
 *
 * Usage:
 *   const s = new Signal(0);
 *   s.get()        // → 0
 *   s.set(1)       // sets value, notifies subscribers
 *   s.update(v => v + 1)
 *   const unsub = s.subscribe(v => console.log(v));
 *   unsub()        // stop listening
 */
export class Signal {
    #value;
    #subscribers = new Set();

    constructor(value) {
        this.#value = value;
    }

    get() {
        return this.#value;
    }

    set(value) {
        this.#value = value;
        this.#notify();
    }

    update(fn) {
        this.set(fn(this.#value));
    }

    /**
     * Subscribe to value changes.
     * Calls fn immediately with the current value (Svelte store contract).
     * Returns an unsubscribe function.
     */
    subscribe(fn) {
        fn(this.#value);
        this.#subscribers.add(fn);
        return () => this.#subscribers.delete(fn);
    }

    #notify() {
        for (const fn of this.#subscribers) {
            fn(this.#value);
        }
    }
}

/**
 * Convenience: create a Signal with array helpers (push, remove, clear).
 */
export class ArraySignal extends Signal {
    constructor(value = []) {
        super(value);
    }

    push(item) {
        this.set([...this.get(), item]);
    }

    remove(item) {
        this.set(this.get().filter(i => i !== item));
    }

    clear() {
        this.set([]);
    }
}
