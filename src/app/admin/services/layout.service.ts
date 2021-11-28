import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class LayoutService {
  private rightPanelTemplateSubject = new BehaviorSubject<TemplateRef<any> | null>(null);
  private rightPanelIsOpenedSubject = new BehaviorSubject<boolean>(false);

  constructor() {

  }

  get rightPanelTemplate$(): Observable<TemplateRef<any> | null> {
    return this.rightPanelTemplateSubject.asObservable();
  }

  get rightPanelIsOpened$(): Observable<boolean> {
    return this.rightPanelIsOpenedSubject.asObservable();
  }

  setRightPanel(template: TemplateRef<any>): void {
    // set change state on the next tick to keep CD happy
    setTimeout(() => {
      this.rightPanelTemplateSubject.next(template);
      this.showRightPanel();
    });
  }

  clearRightPanel(): void {
    // set change state on the next tick to keep CD happy
    setTimeout(() => {
      this.hideRightPanel();
      this.rightPanelTemplateSubject.next(null);
    });
  }

  hideRightPanel(): void {
    this.rightPanelIsOpenedSubject.next(false);
  }

  showRightPanel(): void {
    this.rightPanelIsOpenedSubject.next(true);
  }

}
