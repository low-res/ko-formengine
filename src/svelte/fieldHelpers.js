import { translate } from '../core/config.js';
import { unwrap } from 'ko-fielddefinitions/utils';

/**
 * Returns the stored value for a given option object.
 * @param {any} option
 * @param {import('ko-fielddefinitions/field').default} fielddef
 * @param {import('../core/Inputfield.js').Inputfield} inputfield
 */
export function getOptionValue(option, fielddef, inputfield) {
    const optionsValue = fielddef.optionsValue;
    if (!optionsValue) return option;
    if (typeof optionsValue === 'string') return unwrap(option[optionsValue]);
    if (typeof optionsValue === 'function') return optionsValue(option, inputfield);
    return option;
}

/**
 * Returns the display label for a given option object.
 * @param {any} option
 * @param {import('ko-fielddefinitions/field').default} fielddef
 * @param {import('../core/Inputfield.js').Inputfield} inputfield
 */
export function getOptionLabel(option, fielddef, inputfield) {
    const optionsText = fielddef.optionsText;
    const labelprefix = fielddef.labelprefix ?? '';
    if (optionsText) {
        if (typeof optionsText === 'string') return unwrap(option[optionsText]) ?? '';
        if (typeof optionsText === 'function') return optionsText(option, inputfield);
    }
    return translate(labelprefix + String(option));
}
