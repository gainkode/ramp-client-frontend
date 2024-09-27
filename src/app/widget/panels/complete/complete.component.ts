import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from 'core/app-config';
import { completeDataDefault } from 'model/custom-data.model';
import { CustomTextList, CustomTextType } from 'model/custom-text.model';
import { PageType } from 'model/generated-models';
import { take, takeUntil } from 'rxjs';
import { CommonDataService } from 'services/common-data.service';
import { EnvService } from 'services/env.service';
import { UnsubscriberBase } from 'services/unsubscriber.base';
import { convertStringToArray } from 'utils/utils';

@Component({
	selector: 'app-widget-complete',
	templateUrl: 'complete.component.html',
	styleUrls: ['../../../../assets/profile.scss', '../../../../assets/details.scss']
})
export class WidgetCompleteComponent extends UnsubscriberBase implements OnInit {
  private readonly _commonService = inject(CommonDataService);
  @Input() showRestartButton = false;
  @Input() isWidgetUserParams = false;
  @Input() set textContent(data: string[]) {
  	if (data.length > 0) {
  		this.textData = new CustomTextList(data);
  	}
  }
  @Output() onFinish = new EventEmitter();
  inProgress = false;
  supportEmail = this.config.platformInfo.supportEmail ?? 'support@test.com';
  supportEmailLink = `mailto: ${this.config.platformInfo.supportEmail}` ?? 'mailto: support@test.com';
  productName = EnvService.productFull;
  textData = new CustomTextList([]);
  TEXT_TYPE: typeof CustomTextType = CustomTextType;
  finishLink = EnvService.crypto_widget_finish_link;

  constructor(private router: Router, private config: AppConfig) { super(); }
  
  ngOnInit(): void {
    this.loadCustomData();
  }

  goHome(): void {
  	void this.router.navigateByUrl(this.finishLink).then(() => {
  		window.location.reload();
  	});
  }

  private loadCustomData(): void {
    let completeTextData = completeDataDefault;
    this.inProgress = true;
    
    this._commonService
      .getCustomText()
      .pipe(take(1), takeUntil(this.unsubscribe))
      .subscribe({
        next: (pagesData) => {
          if (pagesData) {
            const completeTextRaw = pagesData.find(
              (page) => page.pageType === PageType.Complete
            )?.pageText;
            
            completeTextData = convertStringToArray(completeTextRaw);
            this.textData = new CustomTextList(completeTextData);
            this.inProgress = false;
          }
        },
        error: () => {
          this.inProgress = false;
        },
      });
  }
}
