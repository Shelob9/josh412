console.log('dashboard.ts');

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
    const el = document.getElementById('dashboard-widgets-wrap');
    removeChildren(el);
    removeChildren(document.getElementById('wpfooter'));
});
