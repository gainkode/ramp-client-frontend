import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
//import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips'; 
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
//import { MatCheckboxModule } from '@angular/material/checkbox';
//import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComponentsModule } from '../components/components.module';
import { AdminGuard } from './admin.guard';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard.component';
import { FeesComponent } from './fees.component';

const routing = RouterModule.forChild([
    {
        path: 'main',
        component: AdminComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
            { path: 'fees', component: FeesComponent, canActivate: [AdminGuard] }
        ],
        canActivate: [AdminGuard]
    },
    { path: '**', redirectTo: 'main/dashboard' }
]);

const modules = [
    MatChipsModule,
    MatTooltipModule,
    //MatTabsModule,
    MatListModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    // MatCheckboxModule,
    // MatRadioModule,
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
    declarations: [AdminComponent, DashboardComponent, FeesComponent],
    providers: [AdminGuard],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule { }
