import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'src/app/services/env.service';

@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['../../../assets/auth.scss']    
})
export class PersonalRestoreComponent {
    inProgress = false;
    errorMessage = '';
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;

    constructor(public router: Router) { }

    onError(error: string) {
        this.errorMessage = error;
    }

    onProgressChange(status: boolean): void {
        this.inProgress = status;
    }
}
