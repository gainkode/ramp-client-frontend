import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayoutService } from './services/layout.service';
import { EmptyObject } from 'apollo-angular/types';
import { Title } from '@angular/platform-browser';
import { AdminDataService } from './services/admin-data.service';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.component.html',
  styleUrls: ['admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  sectionHeader = '';
  rightPanelTemplate: TemplateRef<any> | null = null;

  private destroy$ = new Subject();

  constructor(
    public layoutService: LayoutService,
    public adminDataService: AdminDataService,
    private titleService: Title,
    private router: Router,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.setPageHeader();

    // Observe route changes and update the header accordingly
    this.router.events
        .pipe(
          takeUntil(this.destroy$),
          filter(event => event instanceof NavigationEnd && this.activatedRoute.outlet === 'primary'),
          map(() => undefined)
        )
        .subscribe(() => {
            this.setPageHeader();
          }
        );

    /* region Right panel handling */
    this.layoutService.rightPanelTemplate$
        .pipe(takeUntil(this.destroy$))
        .subscribe(template => {
          this.rightPanelTemplate = template;
        });

    /* endregion */

  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  handleRightPanelClose(): void {
    this.layoutService.hideRightPanel();
  }

  private setPageHeader(): void {
    let endRoute = this.activatedRoute.snapshot;
    while (endRoute.firstChild) {
      endRoute = endRoute.firstChild;
    }

    let header = endRoute.data?.header;
    const id = endRoute.params?.id;
    header = header.replace('{:id}', id);

    this.sectionHeader = header;
    this.titleService.setTitle(`eWallet | Admin${header ? ' | ' : ''}${header}`);
  }

}
