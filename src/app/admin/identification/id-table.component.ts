import { Component, Output, EventEmitter, Input } from '@angular/core';
import { KycScheme } from 'src/app/model/identification.model';

@Component({
    selector: 'identification-table',
    templateUrl: 'id-table.component.html',
    styleUrls: ['../admin.scss', 'identification.component.scss']
})
export class IdTableComponent {
    @Input() schemes: KycScheme[] = [];
    @Input() selectedScheme: KycScheme | null = null;
    @Output() toggle = new EventEmitter<KycScheme>();
    displayedColumns: string[] = ['isDefault', 'name', 'target', 'userType', 'userMode', 'provider', 'details'];

    constructor() { }

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
        return (this.isSelectedScheme(schemeId)) ? 'clear' : 'description';
    }

    getDetailsTooltip(schemeId: string): string {
        return (this.isSelectedScheme(schemeId)) ? 'Close details' : 'Change scheme';
    }

    toggleDetails(scheme: KycScheme): void {
        this.toggle.emit(scheme);
    }
}
