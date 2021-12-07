import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-personal-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['../../../../assets/profile.scss', '../../../../assets/button.scss']
})
export class PersonalSettingsComponent {
    @Output() onShowError = new EventEmitter<string>();

    inProgress = false;
    errorMessage = '';
    selectedTab = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router) {
        const pageId = this.route.snapshot.params['page'] ?? '';
        if (pageId === 'info' || pageId === 'verification' || pageId === 'security') {
            this.pageSelected(pageId);
        } else {
            this.pageSelected('info');
        }
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
