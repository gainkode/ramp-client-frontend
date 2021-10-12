import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { ComponentsModule } from '../components/components.module';
import { PaymentComponent } from './payment.component';
import { ContainerComponentDeprecated } from './container.component';
import { QuickCheckoutComponent } from './quickcheckout.component';
import { WidgetComponent } from './widget/widget.component';
import { WidgetProgressComponent } from './widget/progress.component';
import { WidgetOrderDetailsComponent } from './widget/order-details.component';
import { WidgetSummaryComponent } from './widget/summary.component';
import { WidgetRateComponent } from './widget/rate.component';
import { WidgetRegisterComponent } from './widget/register.component';
import { WidgetLoginAuthComponent } from './widget/login-auth.component';
import { WidgetDisclaimerComponent } from './widget/disclaimer.component';
import { WidgetCompleteComponent } from './widget/complete.component';
import { WidgetPaymentComponent } from './widget/payment.component';
import { WidgetCreditCardComponent } from './widget/credit-card.component';
import { WidgetCodeAuthComponent } from './widget/code-auth.component';
import { WidgetidentificationComponent } from './widget/identification.component';
import { WidgetKycComponent } from './widget/kyc.component';
import { WidgetProcessingComponent } from './widget/processing.component';
import { WidgetSettingsService } from './widget/settings-service.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const routing = RouterModule.forChild([
    { path: 'quickcheckout', component: PaymentComponent },
    { path: 'qc', component: QuickCheckoutComponent },
    { path: 'container/:affiliateCode', component: ContainerComponentDeprecated },
    { path: 'container', component: ContainerComponentDeprecated },
    { path: 'widget/:affiliateCode', component: ContainerComponentDeprecated },
    { path: '**', redirectTo: 'quickcheckout' }
]);

const modules = [
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule,
    MatCheckboxModule,
    ComponentsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [NgxMaskModule.forRoot(), CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule],
    declarations: [PaymentComponent, QuickCheckoutComponent, ContainerComponentDeprecated,
        WidgetComponent, WidgetProgressComponent, WidgetSummaryComponent, WidgetRateComponent, WidgetCreditCardComponent,
        WidgetidentificationComponent, WidgetRegisterComponent, WidgetLoginAuthComponent, WidgetCodeAuthComponent,
        WidgetOrderDetailsComponent, WidgetDisclaimerComponent, WidgetPaymentComponent, WidgetKycComponent,
        WidgetProcessingComponent, WidgetCompleteComponent,
        WidgetSettingsService],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentModule { }
