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
        keyPos = content.indexOf('[%paragraph%]');
        if (keyPos >= 0) {
            content = '';
            this.itemType = CustomTextType.Paragraph;
        }
        keyPos = content.indexOf('[%accept%]');
        if (keyPos >= 0) {
            this.textBlock = content.replace('[%accept%]', '');
            content = '';
            this.itemType = CustomTextType.Accept;
        }
        keyPos = content.indexOf('<%terms%>');
        if (keyPos >= 0) {
            this.textLeft = content.slice(0, keyPos);
            let endPos = content.indexOf('</%terms%>');
            if (endPos >= 0) {
                this.textBlock = content.slice(keyPos + 9, endPos);
                this.textRight = content.slice(endPos + 10);
                this.itemType = CustomTextType.Terms;
            }
            content = this.textLeft;
        }
        this.textLeft = content;
    }
}
