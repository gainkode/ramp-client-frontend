import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['../../../assets/auth.scss']    
})
export class PersonalRestoreComponent {
    inProgress = false;
    errorMessage = '';

    constructor(public router: Router) { }

    onError(error: string) {
        this.errorMessage = error;
    }

    onProgressChange(status: boolean): void {
        this.inProgress = status;
    }
}
