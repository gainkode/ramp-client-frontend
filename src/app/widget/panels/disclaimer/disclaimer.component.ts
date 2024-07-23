import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { AppConfig } from 'core/app-config';
import { disclaimerDataDefault } from 'model/custom-data.model';
import { CustomTextList, CustomTextType } from 'model/custom-text.model';
import { PageType } from 'model/generated-models';
import { take, takeUntil } from 'rxjs';
import { CommonDataService } from 'services/common-data.service';
import { UnsubscriberBase } from 'services/unsubscriber.base';

@Component({
  selector: 'app-widget-disclaimer',
  templateUrl: 'disclaimer.component.html',
  styleUrls: [],
})
export class WidgetDisclaimerComponent extends UnsubscriberBase implements OnInit {
  private readonly _commonService = inject(CommonDataService);
  @Input() agreementChecked = false;
  @Input() backButton = true;
  @Input() set textContent(data: string[]) {
    if (data?.length > 0) {
      this.textData = new CustomTextList(data);
    }
  }
  @Input() errorMessageData = '';
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  done = false;
  termsLink = this.config.platformInfo.termsLink;
  productName = this.config.platformInfo.productFull;
  textData = new CustomTextList([]);
  TEXT_TYPE: typeof CustomTextType = CustomTextType;
  inProgress = false;
  constructor(private config: AppConfig) {
    super();
  }

  ngOnInit(): void {
    this.loadCustomData();
  }

  checkAgreement(): void {
    this.agreementChecked = !this.agreementChecked;
  }

  private loadCustomData(): void {
    let disclaimerTextData = disclaimerDataDefault;
    this.inProgress = true;
    
    this._commonService
      .getCustomText()
      .pipe(take(1), takeUntil(this.unsubscribe))
      .subscribe({
        next: (pagesData) => {
          if (pagesData) {
            const disclaimerTextRaw = pagesData.find(
              (page) => page.pageType === PageType.Disclaimer
            )?.pageText;

            
            disclaimerTextData = this.convertStringToArray(disclaimerTextRaw);
            this.textData = new CustomTextList(disclaimerTextData);
            this.inProgress = false;
          }
        },
        error: () => {
          this.inProgress = false;
        },
      });
  }

  private convertStringToArray(input: string): string[] {
    const lines = input.split('\n').map((line) => line.trim());
    return lines;
  }
}
