import "core-js/stable";
import "regenerator-runtime/runtime";
import ResizeObserver from "resize-observer-polyfill";

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
}
