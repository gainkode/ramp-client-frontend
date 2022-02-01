import { Component, Output, EventEmitter, Input } from '@angular/core';
import { WireTransferBankAccountItem } from '../../../../model/cost-scheme.model';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'bank-accounts.component.html',
  styleUrls: ['bank-accounts.component.scss'],
  selector: 'app-bank-account-table'
})
export class BankAccountsComponent {
  @Input() selectedAccount: WireTransferBankAccountItem | null = null;
  @Input() accounts: WireTransferBankAccountItem[] = [];
  @Output() toggle = new EventEmitter<WireTransferBankAccountItem>();

  displayedColumns: string[] = [
    'details', 'name', 'description', 'auAvailable', 'ukAvailable', 'euAvailable'
  ];

  constructor() {
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
