import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { NgSelectModule } from '@ng-select/ng-select';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DirectiveModule } from '../directives/directives.module';
import { MatRadioModule } from '@angular/material/radio';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AdminNewRoutingModule } from './admin_new.routing.module';
import { AdminNewComponent } from './admin_new.component';
import { AdminNewGuard } from './admin_new.guard';
import { AdminHeaderComponent } from './layout/header/header.component';
import { AdminSidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminSwitcherComponent } from './layout/switcher/switcher.component';
import { AdminTransactionsComponent } from './components/transactions/transactions.component';
import { AdminPageHeaderComponent } from './layout/page-header/page-header.component';
import { AdminDataService } from '../admin_old/services/admin-data.service';
import { AdminTransactionDetailsComponent } from './components/transactions/transaction-details.component';
import { AdminFilterComponent } from './misc/filter/filter.component';
import { AdminDetailsItemComponent } from './misc/details-item/details-item.component';
import { AdminDateRangeComponent } from './misc/date-range/date-range.component';
import { AdminFiatWalletDetailsComponent } from './components/wallets/fiat/fiat-wallet-details.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    NgxMaskModule.forRoot(), 
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatCardModule,
    MatChipsModule,
    MatRadioModule,
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
    ColorPickerModule,
    PerfectScrollbarModule,
    ComponentsModule,
    AdminNewRoutingModule,
    MaterialModule,
    DirectiveModule
  ],
  declarations: [
    AdminNewComponent,
    AdminHeaderComponent,
    AdminPageHeaderComponent,
    AdminSidebarComponent,
    AdminSwitcherComponent,
    AdminDetailsItemComponent,
    AdminDateRangeComponent,
    AdminFilterComponent,
    AdminDashboardComponent,
    AdminTransactionsComponent,
    AdminTransactionDetailsComponent,
    AdminFiatWalletsComponent,
    AdminFiatWalletDetailsComponent
  ],
  providers: [
    AdminNewGuard,
    AdminDataService,
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminNewModule {
}
