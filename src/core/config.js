/**
 * Global configuration for @low-res/formengine.
 *
 * Call configure() once at application startup:
 *
 *   import { configure } from '@low-res/formengine';
 *   import Translator from 'translator';
 *
 *   const t = new Translator(myBooklet);
 *   configure({ translate: (key) => t.translate(key) });
 *
 * The translate function can wrap any i18n library.
 * If not configured, keys are returned as-is.
 */

const _config = {
    translate: (key) => key,
};

export function configure(options = {}) {
    if (options.translate) {
        if (typeof options.translate !== 'function') {
            throw new Error('configure(): translate must be a function');
        }
        _config.translate = options.translate;
    }
}

export function translate(key) {
    return _config.translate(key);
}
