import { Component, Output, EventEmitter, Input } from '@angular/core';
import { KycScheme } from 'src/app/model/identification.model';

@Component({
  selector: 'app-identification-table',
  templateUrl: 'id-table.component.html',
  styleUrls: ['../tab-list/identification-list.component.scss']
})
export class IdTableComponent {
  @Input() schemes: KycScheme[] = [];
  @Input() selectedScheme: KycScheme | null = null;
  @Output() toggle = new EventEmitter<KycScheme>();
  displayedColumns: string[] = [
    'details', 'isDefault', 'name', 'target', 'userType', 'userMode', 'provider', 'level'];

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

  toggleDetails(scheme: KycScheme): void {
    this.toggle.emit(scheme);
  }
}
