import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { KycScheme } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-kyc-schemes',
  templateUrl: 'schemes.component.html',
  styleUrls: ['schemes.component.scss']
})
export class AdminKycSchemesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'details',
    'default',
    'name',
    'target',
    'userType',
    'userMode',
    'provider',
    'level'
  ];
  inProgress = false;
  errorMessage = '';
  detailsTitle = '';
  permission = 0;
  selectedScheme?: KycScheme;
  schemes: KycScheme[] = [];

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('KYC');
  }

  ngOnInit(): void {
    this.loadSchemes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadSchemes(): void {
    this.schemes = [];
    this.inProgress = true;
    const listData$ = this.adminService.getKycSettings().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.schemes = data.list;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showDetails(scheme: KycScheme | undefined, content: any): void {
    this.selectedScheme = scheme;
    if (scheme) {
      this.detailsTitle = 'KYC scheme details';
    } else {
      this.detailsTitle = 'Add new KYC scheme';
    }
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.detailsDialog.closed.subscribe(val => {
        if (this.detailsDialog) {
          this.detailsDialog.close();
          this.loadSchemes();
        }
      })
    );
  }
}
