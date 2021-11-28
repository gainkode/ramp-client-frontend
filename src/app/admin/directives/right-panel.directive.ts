import { Directive, EventEmitter, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';

import { LayoutService } from '../services/layout.service';
import { Subject } from 'rxjs';
import { delay, filter, skip, takeUntil } from 'rxjs/operators';

@Directive({ selector: '[appRightPanel]' })
export class RightPanelDirective implements OnInit, OnDestroy {
  @Output()
  panelClosed = new EventEmitter<void>();

  private destroy$ = new Subject();

  constructor(private template: TemplateRef<any>, private layoutService: LayoutService) {

  }

  ngOnInit(): void {
    this.layoutService.setRightPanel(this.template);

    this.layoutService.rightPanelIsOpened$
        .pipe(
          takeUntil(this.destroy$),
          skip(1), // skip initial closed state
          filter(isOpened => !isOpened),
          delay(300) // let it animate slide out
        )
        .subscribe(() => {
          this.panelClosed.emit();
        });
  }

  ngOnDestroy(): void {
    this.layoutService.clearRightPanel();
    this.destroy$.next();
  }
}
