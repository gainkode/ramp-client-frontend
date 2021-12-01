import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class LayoutService {
  private rightPanelTemplateSubject = new BehaviorSubject<TemplateRef<any> | null>(null);
  private rightPanelIsOpenedSubject = new BehaviorSubject<boolean>(false);
  private hasBackdropSubject = new BehaviorSubject<boolean>(false);
  private rightPanelCloseRequestedSubject = new Subject<void>();

  constructor() {

  }

  get rightPanelTemplate$(): Observable<TemplateRef<any> | null> {
    return this.rightPanelTemplateSubject.asObservable();
  }

  get rightPanelIsOpened$(): Observable<boolean> {
    return this.rightPanelIsOpenedSubject.asObservable();
  }

  get hasBackdrop$(): Observable<boolean> {
    return this.hasBackdropSubject.asObservable();
  }

  get rightPanelCloseRequested$(): Observable<void> {
    return this.rightPanelCloseRequestedSubject.asObservable();
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
      this.setBackdrop(false);
    });
  }

  requestRightPanelClose(): void {
    this.rightPanelCloseRequestedSubject.next();
  }


  hideRightPanel(): void {
    this.rightPanelIsOpenedSubject.next(false);
  }

  showRightPanel(): void {
    this.rightPanelIsOpenedSubject.next(true);
  }

  setBackdrop(enable: boolean): void {
    setTimeout(() => {
      this.hasBackdropSubject.next(enable);
    }, 0);
  }

}
