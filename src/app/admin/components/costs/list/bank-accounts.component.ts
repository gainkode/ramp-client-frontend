import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WireTransferBankAccountItem } from '../../../../model/cost-scheme.model';
import { Subject, Subscription } from 'rxjs';
import { LayoutService } from '../../../services/layout.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: 'bank-accounts.component.html',
  styleUrls: ['bank-accounts.component.scss'],
  selector: 'app-bank-account-table'
})
export class BankAccountsComponent implements OnInit, OnDestroy {
  @Input() selectedAccount: WireTransferBankAccountItem | null = null;
  @Input() accounts: WireTransferBankAccountItem[] = [];
  @Output() toggle = new EventEmitter<WireTransferBankAccountItem>();

  displayedColumns: string[] = [
    'details', 'name', 'description', 'auAvailable', 'ukAvailable', 'euAvailable'
  ];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedAccount = null;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  private isSelectedAccount(schemeId: string): boolean {
    let selected = false;
    if (this.selectedAccount !== null) {
      if (this.selectedAccount.id === schemeId) {
        selected = true;
      }
    }
    return selected;
  }

  getDetailsIcon(schemeId: string): string {
    return (this.isSelectedAccount(schemeId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(schemeId: string): string {
    return (this.isSelectedAccount(schemeId)) ? 'Hide details' : 'Change account';
  }

  toggleDetails(scheme: WireTransferBankAccountItem): void {
    this.toggle.emit(scheme);
  }
}
