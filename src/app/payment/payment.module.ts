import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { ComponentsModule } from '../components/components.module';
import { QuickCheckoutComponent } from './quickcheckout.component';
import { WidgetWrapComponent } from './widget-wrap.component';
import { WidgetModule } from '../widget/widget.module';
import { CryptoWidgetWrapComponent } from './crypto-widget-wrap.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const routing = RouterModule.forChild([
    { path: 'quickcheckout', component: QuickCheckoutComponent },
    { path: 'quickcheckout/:userParamsId', component: QuickCheckoutComponent },
    { path: 'quickcheckout-express/:from/:to/:value', component: QuickCheckoutComponent },
    { path: 'widget/:userParamsId', component: WidgetWrapComponent },
    { path: 'crypto/:userParamsId', component: CryptoWidgetWrapComponent },
    { path: '**', redirectTo: 'quickcheckout' }
]);

@NgModule({
    imports: [NgxMaskModule.forRoot(), CommonModule, FormsModule, ReactiveFormsModule, routing, ComponentsModule, WidgetModule],
    declarations: [QuickCheckoutComponent, WidgetWrapComponent, CryptoWidgetWrapComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentModule {}
