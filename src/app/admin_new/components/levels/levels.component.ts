import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { getCountryByCode3 } from 'src/app/model/country-code.model';
import { KycLevel } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-levels',
  templateUrl: 'levels.component.html',
  styleUrls: ['levels.component.scss']
})
export class AdminLevelsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'details',
    'name',
    'flow',
    'userType'
  ];
  inProgress = false;
  errorMessage = '';
  detailsTitle = '';
  permission = 0;
  selectedLevel?: KycLevel;
  levels: KycLevel[] = [];

  private subscriptions: Subscription = new Subscription();
  private createDialog: NgbModalRef | undefined = undefined;
  private removeDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('KYC');
  }

  ngOnInit(): void {
    this.loadLevels();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadLevels(): void {
    this.levels = [];
    this.inProgress = true;
    const listData$ = this.adminService.getKycLevels(null).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.levels = data.list;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showDetails(level: KycLevel | undefined, content: any): void {
    this.selectedLevel = level;
    if (level) {
      this.detailsTitle = 'KYC level details';
    } else {
      this.detailsTitle = 'Add new KYC level';
    }
    this.createDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.createDialog.closed.subscribe(val => {
        if (this.createDialog) {
          this.createDialog.close();
          this.loadLevels();
        }
      })
    );
  }

  remove(level: KycLevel, content: any): void {
    this.selectedLevel = level;
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.removeCountryConfirmed(this.selectedLevel?.id ?? '');
      })
    );
  }

  private removeCountryConfirmed(id: string): void {
    const c = getCountryByCode3(id);
    if (c) {
      this.errorMessage = '';
      this.inProgress = true;
      const requestData$ = this.adminService.deleteBlackCountry(c.code2);
      this.subscriptions.add(
        requestData$.subscribe(({ data }) => {
          this.inProgress = false;
          if (this.removeDialog) {
            this.removeDialog.close();
            this.loadLevels();
          }
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }
}
