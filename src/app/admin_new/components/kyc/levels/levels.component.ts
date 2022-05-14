import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
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
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.detailsDialog.closed.subscribe(val => {
        this.loadLevels();
      })
    );
  }
}
