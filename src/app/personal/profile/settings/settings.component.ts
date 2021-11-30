import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-personal-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['../../../../assets/profile.scss', '../../../../assets/button.scss']
})
export class PersonalSettingsComponent {
    @Output() onShowError = new EventEmitter<string>();

    inProgress = false;
    errorMessage = '';
    selectedTab = 'info';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private router: Router) {
    }

    pageSelected(id: string): void {
        this.selectedTab = id;
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.onShowError.emit(this.errorMessage);
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }
}
