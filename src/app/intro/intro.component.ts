import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'intro.component.html',
    styleUrls: ['intro.component.scss']
})
export class IntroComponent {
    constructor(private router: Router) { }

    routeTo(link: string): void {
        this.router.navigateByUrl(link);
    }
}
