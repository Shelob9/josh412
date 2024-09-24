export default function debounce(callback:()=>void, wait:number) {
    let timeoutId :number | undefined = undefined;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}
