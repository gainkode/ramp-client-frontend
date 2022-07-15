import { EnvService } from "../services/env.service";

export enum CustomTextType {
    Text = 'Text',
    Title = 'Title',
    Support = 'Support',
    Terms = 'Terms',
    Accept = 'Accept',
    Paragraph = 'Paragraph'
}

export class CustomText {
    private textLeft = '';
    private textRight = '';
    private textBlock = '';
    private itemType = CustomTextType.Text;

    get leftBlock(): string {
        return this.textLeft;
    }

    get rightBlock(): string {
        return this.textRight;
    }

    get keyBlock(): string {
        return this.textBlock;
    }

    get type(): CustomTextType {
        return this.itemType;
    }

    constructor(data: string) {
        let content = data.replace('[%product%]', EnvService.productFull);
        let keyPos = content.indexOf('[%title%]');
        if (keyPos >= 0) {
            content = content.replace('[%title%]', '');
            this.itemType = CustomTextType.Title;
        }
        this.textLeft = content;
    }
}
