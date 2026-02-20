import { describe, it, expect, beforeEach } from 'vitest';
import { configure, translate } from '../core/config.js';

describe('config', () => {
    beforeEach(() => {
        // Reset to identity translator before each test
        configure({ translate: key => key });
    });

    it('translate returns key by default', () => {
        configure({ translate: key => key });
        expect(translate('foo.bar')).toBe('foo.bar');
    });

    it('configure replaces translate function', () => {
        configure({ translate: key => `[${key}]` });
        expect(translate('hello')).toBe('[hello]');
    });

    it('configure ignores unknown options gracefully', () => {
        expect(() => configure({ unknown: true })).not.toThrow();
    });
});
