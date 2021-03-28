import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComponentsModule } from '../components/components.module';
import { AdminGuard } from './admin.guard';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard.component';
import { FeesComponent } from './fees/fees.component';
import { FeeEditorComponent } from './fees/fee-editor.component';
import { CostsComponent } from './costs/costs.component';
import { CostEditorComponent } from './costs/cost-editor.component';
import { IdentificationComponent } from './identification/identification.component';
import { IdTableComponent } from './identification/id-table.component';
import { LevelTableComponent } from './identification/level-table.component';
import { LevelEditorComponent } from './identification/level-editor.component';
import { KycEditorComponent } from './identification/kyc-editor.component';

const routing = RouterModule.forChild([
    {
        path: 'main',
        component: AdminComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
            { path: 'fees', component: FeesComponent, canActivate: [AdminGuard] },
            { path: 'costs', component: CostsComponent, canActivate: [AdminGuard] },
            { path: 'identification', component: IdentificationComponent, canActivate: [AdminGuard] }
        ],
        canActivate: [AdminGuard]
    },
    { path: '**', redirectTo: 'main/dashboard' }
]);

const modules = [
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
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
    declarations: [
        AdminComponent,
        DashboardComponent,
        FeesComponent, FeeEditorComponent,
        CostsComponent, CostEditorComponent,
        IdentificationComponent, IdTableComponent, LevelTableComponent, KycEditorComponent, LevelEditorComponent],
    providers: [AdminGuard],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule { }
