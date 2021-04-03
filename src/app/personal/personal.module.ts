import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PersonalGuard } from './personal.guard';
import { IntroPersonalComponent } from './intro.component';
import { PersonalComponent } from './personal.component';
import { ProfileMainPersonalComponent } from './profile/main.component';
import { KycPersonalComponent } from './profile/kyc.component';
import { ComponentsModule } from '../components/components.module';
import { KycPanelComponent } from '../components/kyc-panel.component';

const routing = RouterModule.forChild([
    { path: 'intro', component: IntroPersonalComponent },
    { path: 'main', component: PersonalComponent, canActivate: [PersonalGuard] },
    { path: 'profile', component: ProfileMainPersonalComponent, canActivate: [PersonalGuard] },
    { path: 'kyc', component: KycPersonalComponent, canActivate: [PersonalGuard] },
    { path: '**', redirectTo: 'main' }
]);

const modules = [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
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
    imports: [ CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule ],
    declarations: [IntroPersonalComponent, PersonalComponent,
        ProfileMainPersonalComponent, KycPersonalComponent],
    providers: [PersonalGuard],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class PersonalModule { }
