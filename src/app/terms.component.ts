import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'terms.component.html',
    styleUrls: ['../assets/button.scss', '../assets/intro.scss']
})
export class TermsComponent {
    constructor(private router: Router) { }

    routeTo(link: string): void {
        this.router.navigateByUrl(link);
    }
}
