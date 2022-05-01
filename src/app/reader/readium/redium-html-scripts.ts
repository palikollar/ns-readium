import { ReadiumHtmlOptions, ReadiumUserView } from "./redium.model";

export const DEBUG_EVENT = "READIUM_DEBUG_EVENT";
export const UPDATE_PAGES_EVENT = "UPDATE_PAGES_EVENT";
export const UPDATE_ORIENTATION_EVENT = "UPDATE_ORIENTATION_EVENT";
export const UPDATE_PAGE_OFFSETS_EVENT = "UPDATE_PAGE_OFFSETS_EVENT";
export const UPDATE_CLIENT_SIZE_EVENT = "UPDATE_CLIENT_SIZE_EVENT";

export const readiumScripts = (options: ReadiumHtmlOptions) => `
    ${convertRemToPixels}
    ${calculateColumns}
    document.calculateColumns = calculateColumns;
    document.isPortrait = ${isPortrait};
    document.isLandscape = ${isLandscape};
    ${calculatePages(options.userView)}
    ${readiumEvents(options)}
`;

const readiumEvents = (options: ReadiumHtmlOptions) =>  `
    window.addEventListener('ns-bridge-ready', function (error) {
        window.nsWebViewBridge.emit('${UPDATE_PAGES_EVENT}', calculatePages());
        ${emitOrientation}
        ${emitClientSize}
        window.nsWebViewBridge.emit('${DEBUG_EVENT}', '');
    });

    window.addEventListener('resize', function (event) {
        window.nsWebViewBridge.emit('${UPDATE_PAGES_EVENT}', calculatePages());
        ${emitOrientation}
        ${emitClientSize}
    });
    
    window.addEventListener('scroll', function (event) {
        ${emitPageOffset}
    });
`;

const isPortrait = `window.matchMedia("(orientation: portrait)").matches`;
const isLandscape = `window.matchMedia("(orientation: landscape)").matches`;

const emitPageOffset =  `
    const pageYOffset = window.pageYOffset;
    const pageXOffset = window.pageXOffset;
    window.nsWebViewBridge.emit('${UPDATE_PAGE_OFFSETS_EVENT}', JSON.stringify({ pageXOffset, pageYOffset }));
`

const emitOrientation = `
    const isPortrait = ${isPortrait};
    const isLandscape = ${isLandscape};
    window.nsWebViewBridge.emit('${UPDATE_ORIENTATION_EVENT}', JSON.stringify({ isLandscape, isPortrait }));
`;

const emitClientSize = `
    const clientHeight = document.body.clientHeight;
    const clientWidth = document.body.clientWidth;
    window.nsWebViewBridge.emit('${UPDATE_CLIENT_SIZE_EVENT}', JSON.stringify({ clientHeight, clientWidth }));
`;

const calculateColumns = `function calculateColumns() {
    const columnWidth = convertRemToPixels(getComputedStyle(document.body).getPropertyValue('--RS__maxLineLength'));
    const firstReadiumElement = document.getElementById('first-readium-element');
    const lastReadiumElement = document.getElementById('last-readium-element');
    const x = lastReadiumElement.getBoundingClientRect().right - firstReadiumElement.getBoundingClientRect().left;
    const clientWidth = document.body.clientWidth;
    return Math.ceil(x / clientWidth);
}
`;

const calculatePages = (userView: ReadiumUserView) => ` function calculatePages() {
    if ('${userView}' === '${ReadiumUserView.PagedOn}') {
        return calculateColumns();
    } else if ('${userView}' === '${ReadiumUserView.ScrollOn}') {
        return 0;
    }
}`;

const convertRemToPixels =  `function convertRemToPixels(rem) {
    return Number(rem.replace('rem', '')) * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
`;