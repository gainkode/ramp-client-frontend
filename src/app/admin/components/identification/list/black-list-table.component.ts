import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
  selector: 'app-black-list-table',
  templateUrl: 'black-list-table.component.html',
  styleUrls: ['../tab-list/identification-list.component.scss']
})
export class BlackListTableComponent {
  @Input() items: CommonTargetValue[] = [];
  @Input() selectedCountry: CommonTargetValue | null = null;
  @Output() toggle = new EventEmitter<CommonTargetValue>();

  displayedColumns: string[] = [ 'details', 'id', 'name' ];

  constructor() {
  }

  private isSelectedCountry(itemId: string): boolean {
    let selected = false;
    if (this.selectedCountry !== null) {
      if (this.selectedCountry.id === itemId) {
        selected = true;
      }
    }
    return selected;
  }

  getDetailsIcon(itemId: string): string {
    return (this.isSelectedCountry(itemId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(itemId: string): string {
    return (this.isSelectedCountry(itemId)) ? 'Hide details' : 'Change scheme';
  }

  toggleDetails(item: CommonTargetValue): void {
    this.toggle.emit(item);
  }
}
