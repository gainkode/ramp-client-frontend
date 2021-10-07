import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ComponentsModule } from '../components/components.module';
import { ResetComponent } from './reset.component';

const routing = RouterModule.forChild([
    { path: 'login', redirectTo: '/personal/auth/login' },
    { path: 'register', redirectTo: '/personal/auth/register' },
    { path: 'success/:type', redirectTo: '/personal/auth/success/:type' },
    { path: 'confirm-email/:token', redirectTo: '/personal/auth/confirm-email/:token' },
    { path: 'confirm-device/:token', redirectTo: '/personal/auth/confirm-device/:token' },
    { path: 'new-password/:token', component: ResetComponent },
    { path: 'restore', redirectTo: '/personal/auth/restore' },
    { path: '**', redirectTo: '/personal/auth/login' }
]);

const modules = [
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule,
    ComponentsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule
    ],
    declarations: [
        ResetComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalAuthModule { }
