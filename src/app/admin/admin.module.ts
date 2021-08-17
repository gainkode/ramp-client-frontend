import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeesComponent } from './fees/fees.component';
import { FeeEditorComponent } from './fees/fee-editor.component';
import { CostsComponent } from './costs/costs.component';
import { CostEditorComponent } from './costs/cost-editor.component';
import { IdentificationComponent } from './identification/identification.component';
import { IdTableComponent } from './identification/id-table.component';
import { LevelTableComponent } from './identification/level-table.component';
import { LevelEditorComponent } from './identification/level-editor.component';
import { KycEditorComponent } from './identification/kyc-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TransactionsComponent } from './transactions/transactions.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/customer-details.component';
import { TransactionDetailsComponent } from './transactions/transaction-details.component';
import { CustomerInfoComponent } from './customers/customer-info.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminSectionGuard } from './admin-section.guard';
import { DefaultComponent } from './default.component';
import { DashboardBalancesComponent } from './dashboard/dashboard-balances.component';

const routing = RouterModule.forChild([
    {
        path: 'main',
        component: AdminComponent,
        canActivateChild: [AdminSectionGuard],
        children: [
            { path: 'default', component: DefaultComponent, canActivate: [AdminGuard] },
            { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
            { path: 'transactions', component: TransactionsComponent, canActivate: [AdminGuard] },
            { path: 'customers', component: CustomersComponent, canActivate: [AdminGuard] },
            { path: 'fees', component: FeesComponent, canActivate: [AdminGuard] },
            { path: 'costs', component: CostsComponent, canActivate: [AdminGuard] },
            { path: 'identification', component: IdentificationComponent, canActivate: [AdminGuard] }
        ],
        canActivate: [AdminGuard]
    },
    { path: '**', redirectTo: 'main/default' }
    //{ path: '**', redirectTo: 'main/dashboard' }
]);

const modules = [
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    DragDropModule,
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
        DefaultComponent,  // to be removed
        DashboardComponent, DashboardBalancesComponent,
        TransactionsComponent, TransactionDetailsComponent,
        CustomersComponent, CustomerDetailsComponent, CustomerInfoComponent,
        FeesComponent, FeeEditorComponent,
        CostsComponent, CostEditorComponent,
        IdentificationComponent, IdTableComponent, LevelTableComponent, KycEditorComponent, LevelEditorComponent],
    providers: [AdminGuard, AdminSectionGuard],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule { }
