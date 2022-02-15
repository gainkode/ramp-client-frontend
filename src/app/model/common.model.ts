import { EventEmitter } from '@angular/core';

export class TargetParams {
    title = '';
    inputPlaceholder = '';
    dataList: CommonTargetValue[] = [];
}

export class CommonTargetValue {
    id = '';
    title = '';
    imgClass = '';
    imgSource = '';
}

export class CommonGroupValue {
    id = '';
    values: string[] = [];
}

export interface MenuItem {
    id: string;
    name: string;
    url: string;
    icon: string;
    code: string;
}
