import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentsModule } from '../components/components.module';
import { WidgetComponent } from './widget.component';
import { WidgetProgressComponent } from './panels/progress.component';
import { WidgetOrderDetailsComponent } from './panels/order-details.component';
import { WidgetSummaryComponent } from './panels/summary.component';
import { WidgetRateComponent } from './panels/rate.component';
import { WidgetRegisterComponent } from './panels/register.component';
import { WidgetLoginAuthComponent } from './panels/login-auth.component';
import { WidgetDisclaimerComponent } from './panels/disclaimer.component';
import { WidgetCompleteComponent } from './panels/complete.component';
import { WidgetPaymentComponent } from './panels/payment.component';
import { WidgetCreditCardComponent } from './panels/credit-card.component';
import { WidgetCodeAuthComponent } from './panels/code-auth.component';
import { WidgetKycComponent } from './panels/kyc.component';
import { WidgetProcessingFrameComponent } from './panels/processing-frame.component';
import { WidgetSettingsService } from './panels/settings-service.component';
import { WidgetProcessingInstantpayComponent } from './panels/processing-instantpay.component';
import { WidgetInitializationComponent } from './panels/initialization.component';
import { WidgetPanelComponent } from './widget-panel.component';
import { RouterModule } from '@angular/router';
import { ReceiveWidgetComponent } from './receive.component';
import { WidgetReceiveDetailsComponent } from './panels/receive-details.component';
import { QRCodeModule } from 'angularx-qrcode';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

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
    imports: [
        NgxMaskModule.forRoot(), CommonModule, ClipboardModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule, QRCodeModule],
    declarations: [
        WidgetComponent, ReceiveWidgetComponent, WidgetPanelComponent, WidgetProgressComponent,
        WidgetSummaryComponent, WidgetRateComponent, WidgetCreditCardComponent,
        WidgetRegisterComponent, WidgetLoginAuthComponent, WidgetCodeAuthComponent,
        WidgetInitializationComponent, WidgetOrderDetailsComponent, WidgetReceiveDetailsComponent, WidgetDisclaimerComponent, WidgetKycComponent,
        WidgetPaymentComponent, WidgetProcessingFrameComponent, WidgetProcessingInstantpayComponent, WidgetCompleteComponent,
        WidgetSettingsService],
    exports: [WidgetComponent, WidgetPanelComponent, ReceiveWidgetComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WidgetModule { }
