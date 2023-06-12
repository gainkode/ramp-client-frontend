import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { KycTier } from 'model/identification.model';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-admin-kyc-tiers',
  templateUrl: 'tiers.component.html',
  styleUrls: ['tiers.component.scss']
})
export class AdminKycTiersComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'details',
    'default',
    'name',
    'description',
    'amount',
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
  selectedTier?: KycTier;
  tiers: KycTier[] = [];

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
    this.loadTiers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadTiers(): void {
    this.tiers = [];
    this.inProgress = true;
    const listData$ = this.adminService.getKycTiers().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.tiers = data.list;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showDetails(tier: KycTier | undefined, content: any): void {
    this.selectedTier = tier;
    if (tier) {
      this.detailsTitle = 'KYC tier details';
    } else {
      this.detailsTitle = 'Add new KYC tier';
    }
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.detailsDialog.closed.subscribe(val => {
        this.loadTiers();
      })
    );
  }
}
