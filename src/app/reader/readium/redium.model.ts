export interface ReadiumHtmlOptions {
    head?: string;
    body: string;
    userView: ReadiumUserView;
}

export interface ReadiumOrientation {
    isLandscape: boolean;
    isPortrait: boolean;
}

export enum ReadiumUserView {
    PagedOn = 'readium-paged-on',
    ScrollOn = 'readium-scroll-on',
}

export interface PageOffsets {
    pageXOffset: number;
    pageYOffset: number;
}

export interface Dimensions {
    clientHeight: number;
    clientWidth: number;
    innerHeight: number;
    innerWidth: number;
}