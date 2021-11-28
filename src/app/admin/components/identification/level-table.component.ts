import { Component, Output, EventEmitter, Input } from '@angular/core';
import { KycLevel } from 'src/app/model/identification.model';

@Component({
  selector: 'app-level-table',
  templateUrl: 'level-table.component.html',
  styleUrls: ['identification.component.scss']
})
export class LevelTableComponent {
  @Input() levels: KycLevel[] = [];
  @Input() selectedLevel: KycLevel | null = null;
  @Output() toggle = new EventEmitter<KycLevel>();
  displayedColumns: string[] = ['name', 'flow', 'userType', 'details'];

  constructor() {
  }

  private isSelectedLevel(levelId: string): boolean {
    let selected = false;
    if (this.selectedLevel !== null) {
      if (this.selectedLevel.id === levelId) {
        selected = true;
      }
    }
    return selected;
  }

  getDetailsIcon(levelId: string): string {
    return (this.isSelectedLevel(levelId)) ? 'clear' : 'description';
  }

  getDetailsTooltip(levelId: string): string {
    return (this.isSelectedLevel(levelId)) ? 'Hide details' : 'Change level';
  }

  toggleDetails(level: KycLevel): void {
    this.toggle.emit(level);
  }
}
