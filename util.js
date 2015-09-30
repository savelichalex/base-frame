export function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
    } else {
        elem.attachEvent("on" + event, function () {
            // set the this pointer same as addEventListener when fn is called
            return (fn.call(elem, window.event));
        });
    }
}