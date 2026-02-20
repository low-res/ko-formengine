import { mount } from 'svelte';
import App from './App.svelte';
import { configure } from '../src/index.js';

// Configure a simple pass-through translator
// Replace with a real Translator instance in your app:
//   import Translator from 'translator';
//   const t = new Translator(myBooklet);
//   configure({ translate: (key) => t.translate(key) });
configure({
    translate: (key) => {
        const labels = {
            'form_submit_label': 'Submit',
            'form_cancel_label': 'Cancel',
            'general.optionscaption': 'Please choose...',
            'multiselect.selectall': 'Select all',
            'multiselect.removeall': 'Remove all',
        };
        return labels[key] ?? key;
    }
});

mount(App, { target: document.getElementById('app') });
