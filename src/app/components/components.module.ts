import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DropdownItemComponent } from './dropdown-item.component';
import { BackButtonComponent } from './backbutton.component';
import { TabLabelComponent } from './tablabel.component';
import { KycPanelComponent } from './kyc-panel.component';
import { LineBreakPipe } from '../utils/line-break.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog'; 
import { CommonDialogBox } from './common-box.dialog';
import { CheckoutSummaryComponent } from './checkout-summary.component';

const materialModules = [
    MatButtonModule,
    MatDialogModule,
    MatIconModule
];

@NgModule({
    imports: [...materialModules],
    exports: [...materialModules]
})
export class MaterialModule { }

@NgModule({
    imports: [CommonModule, MaterialModule, MatProgressBarModule],
    declarations: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, LineBreakPipe, CommonDialogBox],
    exports: [DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        CheckoutSummaryComponent, MatProgressBarModule, LineBreakPipe, CommonDialogBox],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule { }
