import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_CHIPS_DEFAULT_OPTIONS, MatChipsModule } from '@angular/material/chips';
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
import { ComponentsModule, MaterialModule } from '../components/components.module';
import { AdminGuard } from './admin.guard';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CostsComponent } from './components/costs/costs.component';
import { CostEditorComponent } from './components/costs/cost-editor.component';
import { IdentificationComponent } from './components/identification/identification.component';
import { IdTableComponent } from './components/identification/id-table.component';
import { LevelTableComponent } from './components/identification/level-table.component';
import { LevelEditorComponent } from './components/identification/level-editor.component';
import { KycEditorComponent } from './components/identification/kyc-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CustomerListComponent } from './components/customers/list/customer-list.component';
import { CustomerDetailsComponent } from './components/customers/details/customer-details.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterPanelComponent } from './components/core/filter-panel/filter-panel.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ReconciliationComponent } from './components/reconciliation/reconciliation.component';
import { SystemUsersComponent } from './components/system-users/system-users.component';
import { RiskCenterComponent } from './components/risk-center/risk-center.component';
import { WidgetsComponent } from './components/widgets/widgets.component';
import { MainMenuComponent } from './components/core/main-menu/main-menu.component';
import { AdminRoutingModule } from './admin.routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutService } from './services/layout.service';
import { RightPanelDirective } from './directives/right-panel.directive';
import { TransactionSingleComponent } from './components/transactions/transaction-single/transaction-single.component';
import { TransactionListComponent } from './components/transactions/list/transaction-list.component';
import { TransactionDetailsComponent } from './components/transactions/details/transaction-details.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminDataService } from './services/admin-data.service';
import { DataCardComponent } from './components/dashboard/data-card/data-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { FilterFieldUserComponent } from './components/core/filter-panel/filter-fields/user/filter-field-user.component';
import { FilterFieldCountryComponent } from './components/core/filter-panel/filter-fields/country/filter-field-country.component';
import { FilterFieldWidgetComponent } from './components/core/filter-panel/filter-fields/widget/filter-field-widget.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { WalletListComponent } from './components/wallets/list/wallet-list.component';
import { FeeDetailsComponent } from './components/fees/fee-details/fee-details.component';
import { FeeListComponent } from './components/fees/fee-list/fee-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatSidenavModule,
    MatTooltipModule,
    MatTabsModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
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
    MatToolbarModule,
    MatSnackBarModule,
    ComponentsModule,
    AdminRoutingModule,
    MaterialModule
  ],
  declarations: [
    MainMenuComponent,
    AdminComponent,
    FilterPanelComponent,
    DashboardComponent,
    TransactionListComponent,
    TransactionSingleComponent,
    TransactionDetailsComponent,
    CustomerListComponent,
    CustomerDetailsComponent,
    WalletListComponent,
    FeeListComponent,
    FeeDetailsComponent,
    NotificationsComponent,
    CostsComponent, CostEditorComponent,
    IdentificationComponent,
    IdTableComponent,
    LevelTableComponent,
    KycEditorComponent,
    LevelEditorComponent,
    ReconciliationComponent,
    SystemUsersComponent,
    RiskCenterComponent,
    WidgetsComponent,
    RightPanelDirective,
    TransactionSingleComponent,
    DataCardComponent,
    FilterFieldUserComponent,
    FilterFieldCountryComponent,
    FilterFieldWidgetComponent
  ],
  providers: [
    LayoutService,
    AdminDataService,
    AdminGuard,
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
}
