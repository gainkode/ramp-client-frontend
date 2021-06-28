import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { QrCodeData } from '../model/common.model';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
    selector: 'app-two-fa-code',
    templateUrl: 'two-fa-code.component.html',
    styleUrls: ['two-fa-code.component.scss']
})
export class TwoFaCodeComponent {
    @Input() data!: QrCodeData;

    codeForm = this.formBuilder.group({
        code: [ '', { validators: [Validators.required], updateOn: 'change' } ]
    });

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) {
    }

    onSubmit() {
        
    }
}
