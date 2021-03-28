import { Component, Output, EventEmitter, Input } from '@angular/core';
import { KycLevel } from 'src/app/model/identification.model';

@Component({
    selector: 'level-table',
    templateUrl: 'level-table.component.html',
    styleUrls: ['../admin.scss', 'identification.component.scss']
})
export class LevelTableComponent {
    @Input() levels: KycLevel[] = [];
    @Input() selectedLevel: KycLevel | null = null;
    @Output() toggle = new EventEmitter<KycLevel>();
    displayedColumns: string[] = ['name', 'flow', 'details'];

    constructor() { }

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
        return (this.isSelectedLevel(levelId)) ? 'Close details' : 'Change level';
    }

    toggleDetails(level: KycLevel): void {
        this.toggle.emit(level);
    }
}
