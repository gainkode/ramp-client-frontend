import { Component } from
    '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
@Component({
    selector: 'app-two-FA',
    templateUrl: './profile-two-FA.component.html'
})
export class ProfileTwoFAComponent {
    inProgress = false;
    errorMessage = '';
    twoFaEmabled = true;

    enabledChange(event: MatSlideToggleChange): void {
        if (event.checked) {
            this.enable2Fa();
        } else {
            this.disable2Fa();
        }
    }

    private enable2Fa(): void {
console.log('enabled');
    }
    
    private disable2Fa(): void {
        console.log('disabled');
    }
}