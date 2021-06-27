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

export class QrCodeData {
    code: string = '';
    symbols: string = '';
    url: string = '';
}
