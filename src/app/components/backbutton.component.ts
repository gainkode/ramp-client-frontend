import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-back-button',
    templateUrl: 'backbutton.component.html'
})
export class BackButtonComponent {
    constructor(private location: Location) { }

    goBack(): void {
        this.location.back();
    }
}
