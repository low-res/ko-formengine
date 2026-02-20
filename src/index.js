/**
 * @low-res/formengine
 *
 * Framework-agnostic declarative form engine.
 *
 * Core exports — no frontend framework required:
 *   import { Form, Inputfield, configure } from '@low-res/formengine';
 *
 * Svelte 5 reference components:
 *   import { GenericForm, Formfield } from '@low-res/formengine/svelte';
 */

export { Form } from './core/Form.js';
export { Inputfield } from './core/Inputfield.js';
export { Signal, ArraySignal } from './core/Signal.js';
export { configure, translate } from './core/config.js';
