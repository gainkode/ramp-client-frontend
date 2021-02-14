import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AdminMenuItem, AdminMenuItems } from '../model/admin-menu-list';
import { MatSelectionListChange } from '@angular/material/list/selection-list';

@Component({
    templateUrl: 'admin.component.html'
})
export class AdminComponent {
    menuItems: AdminMenuItem[] = AdminMenuItems;

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }

    menuChanged(e: MatSelectionListChange): void {
        let selection = e.options[0].value;
        console.log(selection);
    }
}
