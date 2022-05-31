import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../services/error.service';

@Component({
  templateUrl: 'reconciliation.component.html',
  styleUrls: []
})
export class ReconciliationComponent {
  @Output() changeEditMode = new EventEmitter<boolean>();
  inProgress = false;
  errorMessage = '';
  permission = 0;

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
      this.permission = this.auth.isPermittedObjectCode('RECONCILIATION');
  }
}
