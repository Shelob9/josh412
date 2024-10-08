console.log('dashboard.ts');
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';

function removeChildren(el: HTMLElement|null){
    if(!el) {
        return;
    }
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}
//on ready
window.addEventListener('DOMContentLoaded', (event) => {
    const el = document.getElementById('wpbody-content');
    if(!el){
        return;
    }
    el.setAttribute('notranslate', 'true' );
    removeChildren(el);

    removeChildren(document.getElementById('wpfooter'));
    //react dom client render on el
    const root = createRoot(el);
    root.render(<div className="wrap">
        <h1>Dashboard</h1>
        <Dashboard />
    </div>);

});
