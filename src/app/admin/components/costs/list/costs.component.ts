import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CostScheme } from '../../../../model/cost-scheme.model';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'costs.component.html',
  styleUrls: ['costs.component.scss'],
  selector: 'app-cost-table'
})
export class CostsComponent implements OnInit, OnDestroy {
  @Input() selectedScheme: CostScheme | null = null;
  @Input() schemes: CostScheme[] = [];
  @Output() toggle = new EventEmitter<CostScheme>();

  displayedColumns: string[] = [
    'details', 'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  private subscriptions: Subscription = new Subscription();

  constructor() {
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private isSelectedScheme(schemeId: string): boolean {
    let selected = false;
    if (this.selectedScheme !== null) {
      if (this.selectedScheme.id === schemeId) {
        selected = true;
      }
    }
    return selected;
  }

  getDetailsIcon(schemeId: string): string {
    return (this.isSelectedScheme(schemeId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(schemeId: string): string {
    return (this.isSelectedScheme(schemeId)) ? 'Hide details' : 'Change scheme';
  }

  toggleDetails(scheme: CostScheme): void {
    this.toggle.emit(scheme);
  }
}
