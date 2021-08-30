import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';

@Component({
  templateUrl: 'system-users.component.html',
  styleUrls: ['../admin.scss']
})
export class SystemUsersComponent {
  @Output() changeEditMode = new EventEmitter<boolean>();
  inProgress = false;
  errorMessage = '';
  
  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
  }
}
