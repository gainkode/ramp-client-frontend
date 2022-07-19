import { EnvService } from "../services/env.service";

export enum CustomTextType {
    Text = 'Text',
    MainTitle = 'MainTitle',
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
        let content = data;
        while (content.includes('{%product%}')) {
            content = content.replace('{%product%}', EnvService.productFull);
        }
        let keyPos = content.indexOf('[%title%]');
        if (keyPos >= 0) {
            this.textBlock = content.replace('[%title%]', '');
            content = '';
            this.itemType = CustomTextType.Title;
        }
        keyPos = content.indexOf('[%main_title%]');
        if (keyPos >= 0) {
            this.textBlock = content.replace('[%main_title%]', '');
            content = '';
            this.itemType = CustomTextType.MainTitle;
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
        keyPos = content.indexOf('{%support%}');
        if (keyPos >= 0) {
            this.textLeft = content.slice(0, keyPos);
            let endPos = content.indexOf('{%support%}');
            if (endPos >= 0) {
                this.textRight = content.slice(endPos + 11);
                this.itemType = CustomTextType.Support;
            }
            content = this.textLeft;
        }
        this.textLeft = content;
    }
}

export class CustomTextBlock {
    private listInternal: CustomText[] = [];

    get list(): CustomText[] {
        return this.listInternal;
    }

    add(item: CustomText): void {
        this.listInternal.push(item);
    }

    clear(): void {
        this.listInternal = [];
    }
}

export class CustomTextList {
    private blocksInternal: CustomTextBlock[] = [];

    get blocks(): CustomTextBlock[] {
        return this.blocksInternal;
    }

    constructor(data: string[]) {
        const list = data.map(x => new CustomText(x));
        let block: CustomTextBlock | undefined = undefined;
        list.forEach(x => {
            if (x.type !== CustomTextType.Paragraph) {
                if (!block) {
                    block = new CustomTextBlock();
                }
                block.add(x);
            } else {
                if (block) {
                    this.blocks.push(block);
                }
                block = undefined;
            }
        });
        if (block) {
            this.blocks.push(block);
        }
    }
}