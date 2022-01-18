import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask'
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
import { IdentificationListComponent } from './components/identification/list/identification-list.component';
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
import { NotificationListComponent } from './components/notifications/list/notification-list.component';
import { ReconciliationComponent } from './components/reconciliation/reconciliation.component';
import { WidgetListComponent } from './components/widgets/list/widget-list.component';
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
import { FilterFieldCountryComponent } from './components/core/filter-panel/filter-fields/country/filter-field-country.component';
import { FilterFieldWidgetComponent } from './components/core/filter-panel/filter-fields/widget/filter-field-widget.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { WalletListComponent } from './components/wallets/list/wallet-list.component';
import { FeeDetailsComponent } from './components/fees/fee-details/fee-details.component';
import { FeeListComponent } from './components/fees/fee-list/fee-list.component';
import { DetailsAttributeComponent } from './components/core/details-attribute/details-attribute.component';
import { WidgetEditorComponent } from './components/widgets/editor/widget-editor.component';
import { RiskAlertListComponent } from './components/risk-center/list/risk-alert-list.component';
import {
  FilterFieldRiskAlertCodeComponent
} from './components/core/filter-panel/filter-fields/risk-alert-code/filter-field-risk-alert-code.component';
import {
  FilterFieldUserSingleComponent
} from './components/core/filter-panel/filter-fields/user-single/filter-field-user-single.component';
import {
  FilterFieldUserMultipleComponent
} from './components/core/filter-panel/filter-fields/user-multiple/filter-field-user-multiple.component';
import { AdminSettingsComponent } from './components/settings/settings.component';
import { CommonSettingsEditorComponent } from './components/settings/common/common-settings.component';
import { WalletDetailsComponent } from './components/wallets/details/wallet-details.component';
import { NotificationDetailsComponent } from './components/notifications/details/notification-details.component';
import { CustomerSingleComponent } from './components/customers/customer-single/customer-single.component';
import { SystemUserListComponent } from './components/system-users/list/user-list.component';
import { SystemUserSingleComponent } from './components/system-users/user-single/user-single.component';
import { SystemUserDetailsComponent } from './components/system-users/details/user-details.component';
import { DirectiveModule } from '../directives/directives.module';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

@NgModule({
  imports: [
    NgxMaskModule.forRoot(), 
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
    MaterialModule,
    DirectiveModule
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
    CustomerSingleComponent,
    CustomerDetailsComponent,
    WalletListComponent,
    WalletDetailsComponent,
    FeeListComponent,
    FeeDetailsComponent,
    NotificationListComponent,
    NotificationDetailsComponent,
    CostsComponent, CostEditorComponent,
    IdentificationListComponent,
    IdTableComponent,
    LevelTableComponent,
    KycEditorComponent,
    LevelEditorComponent,
    ReconciliationComponent,
    SystemUserListComponent,
    SystemUserSingleComponent,
    SystemUserDetailsComponent,
    RiskAlertListComponent,
    WidgetListComponent,
    RightPanelDirective,
    TransactionSingleComponent,
    DataCardComponent,
    FilterFieldUserSingleComponent,
    FilterFieldUserMultipleComponent,
    FilterFieldCountryComponent,
    FilterFieldWidgetComponent,
    FilterFieldRiskAlertCodeComponent,
    DetailsAttributeComponent,
    WidgetEditorComponent,
    AdminSettingsComponent,
    CommonSettingsEditorComponent
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
