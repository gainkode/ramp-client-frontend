import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'back-button',
    templateUrl: 'backbutton.component.html'
})
export class BackButtonComponent {
    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }
}
