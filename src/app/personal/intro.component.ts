import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'intro.component.html',
    styleUrls: ['../menu.scss']
})
export class IntroPersonalComponent {
    constructor(private router: Router) { }

    routeTo(link: string): void {
        this.router.navigateByUrl(link);
    }
}
