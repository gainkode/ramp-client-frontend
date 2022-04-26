import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CostScheme } from '../../../../model/cost-scheme.model';

@Component({
  templateUrl: 'costs.component.html',
  styleUrls: ['costs.component.scss'],
  selector: 'app-cost-table'
})
export class CostsComponent {
  @Input() selectedScheme: CostScheme | null = null;
  @Input() schemes: CostScheme[] = [];
  @Output() toggle = new EventEmitter<CostScheme>();

  displayedColumns: string[] = [
    'details', 'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  constructor() {
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
