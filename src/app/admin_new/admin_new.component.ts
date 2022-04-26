import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { SwitcherService } from './services/switcher.service';

@Component({
  selector: 'app-admin-new',
  templateUrl: 'admin_new.component.html',
  styleUrls: ['admin_new.component.scss']
})
export class AdminNewComponent implements OnInit, OnDestroy {
  sectionHeader = '';

  private destroy$ = new Subject();

  constructor(
    private router: Router,
    private auth: AuthService,
    public switcherService: SwitcherService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  toggleSwitcherBody() {
    this.switcherService.emitChange(false);
  }
}
