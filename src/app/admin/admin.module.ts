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
import { DashboardBalancesComponent } from './dashboard/dashboard-balances.component';
import { DashboardFeesComponent } from './dashboard/dashboard-fees.component';
import { DashboardTotalComponent } from './dashboard/dashboard-total.component';
import { DashboardTransactionsComponent } from './dashboard/dashboard-transactions.component';
import { DashboardFilterComponent } from './dashboard/dashboard-filter.component';
import { WalletsComponent } from './wallets/wallets.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { SystemUsersComponent } from './system-users/system-users.component';
import { RiskCenterComponent } from './risk-center/risk-center.component';
import { AffiliatesComponent } from './affiliates/affiliates.component';

const routing = RouterModule.forChild([
    {
        path: 'main',
        component: AdminComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
            { path: 'transactions', component: TransactionsComponent, canActivate: [AdminGuard] },
            { path: 'customers', component: CustomersComponent, canActivate: [AdminGuard] },
            { path: 'wallets', component: WalletsComponent, canActivate: [AdminGuard] },
            { path: 'fees', component: FeesComponent, canActivate: [AdminGuard] },
            { path: 'notifications', component: NotificationsComponent, canActivate: [AdminGuard] },
            { path: 'costs', component: CostsComponent, canActivate: [AdminGuard] },
            { path: 'identification', component: IdentificationComponent, canActivate: [AdminGuard] },
            { path: 'reconciliation', component: ReconciliationComponent, canActivate: [AdminGuard] },
            { path: 'system-users', component: SystemUsersComponent, canActivate: [AdminGuard] },
            { path: 'risk-center', component: RiskCenterComponent, canActivate: [AdminGuard] },
            { path: 'affiliates', component: AffiliatesComponent, canActivate: [AdminGuard] },
            { path: '**', redirectTo: 'dashboard' }
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
        DashboardComponent, DashboardTotalComponent, DashboardFilterComponent,
        DashboardBalancesComponent, DashboardTransactionsComponent, DashboardFeesComponent,
        TransactionsComponent, TransactionDetailsComponent,
        CustomersComponent, CustomerDetailsComponent, CustomerInfoComponent,
        WalletsComponent,
        FeesComponent, FeeEditorComponent,
        NotificationsComponent,
        CostsComponent, CostEditorComponent,
        IdentificationComponent, IdTableComponent, LevelTableComponent, KycEditorComponent, LevelEditorComponent,
        ReconciliationComponent,
        SystemUsersComponent,
        RiskCenterComponent,
        AffiliatesComponent],
    providers: [AdminGuard],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule { }
