import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { TransactionShort } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';

@Component({
    selector: 'app-widget-code-auth',
    templateUrl: 'code-auth.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetCodeAuthComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('code1input') code1input: ElementRef | undefined = undefined;
    @ViewChild('code2input') code2input: ElementRef | undefined = undefined;
    @ViewChild('code3input') code3input: ElementRef | undefined = undefined;
    @ViewChild('code4input') code4input: ElementRef | undefined = undefined;
    @ViewChild('code5input') code5input: ElementRef | undefined = undefined;
    @ViewChild('codeinput') codeinput: ElementRef | undefined = undefined;
    @Input() email = '';
    @Input() codeLength = 5;
    @Input() errorMessage = '';
    @Input() transactionIdConfirmationCode = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onRegister = new EventEmitter<string>();
    @Output() onComplete = new EventEmitter();
    @Output() onTransactionComplete = new EventEmitter();

    private pSubscriptions: Subscription = new Subscription();

    extraData = false;
    validData = false;
    init = false;
    done = false;
    codeErrorMessages: { [key: string]: string; } = {
        ['required']: 'Confirmation code is required'
    };

    dataForm = this.formBuilder.group({
        code1: [undefined, { validators: [Validators.required], updateOn: 'change' }],
        code2: [undefined, { validators: [Validators.required], updateOn: 'change' }],
        code3: [undefined, { validators: [Validators.required], updateOn: 'change' }],
        code4: [undefined, { validators: [Validators.required], updateOn: 'change' }],
        code5: [undefined, { validators: [Validators.required], updateOn: 'change' }],
        code: [undefined, { validators: [Validators.required], updateOn: 'change' }]
    });

    get code1Field(): AbstractControl | null {
        return this.dataForm.get('code1');
    }

    get code2Field(): AbstractControl | null {
        return this.dataForm.get('code2');
    }

    get code3Field(): AbstractControl | null {
        return this.dataForm.get('code3');
    }

    get code4Field(): AbstractControl | null {
        return this.dataForm.get('code4');
    }

    get code5Field(): AbstractControl | null {
        return this.dataForm.get('code5');
    }

    get codeField(): AbstractControl | null {
        return this.dataForm.get('code');
    }

    constructor(
        private formBuilder: UntypedFormBuilder,
        private errorHandler: ErrorService,
        private auth: AuthService,
        private dataService: PaymentDataService) { }

    ngOnInit(): void {
        this.pSubscriptions.add(this.dataForm.valueChanges.subscribe({ next: (result: any) => this.onFormUpdated() }));
        this.pSubscriptions.add(this.code1Field?.valueChanges.subscribe(val => this.onCodeUpdated(val, 1)));
        this.pSubscriptions.add(this.code2Field?.valueChanges.subscribe(val => this.onCodeUpdated(val, 2)));
        this.pSubscriptions.add(this.code3Field?.valueChanges.subscribe(val => this.onCodeUpdated(val, 3)));
        this.pSubscriptions.add(this.code4Field?.valueChanges.subscribe(val => this.onCodeUpdated(val, 4)));
        this.pSubscriptions.add(this.code5Field?.valueChanges.subscribe(val => this.onCodeUpdated(val, 5)));
    }

    ngAfterViewInit(): void {
        const focusInput = (this.codeLength === 5) ?
            this.code1input?.nativeElement as HTMLInputElement :
            this.codeinput?.nativeElement as HTMLInputElement;
        if (focusInput !== undefined) {
            setTimeout(() => {
                focusInput?.focus();
            }, 100);
        }
    }

    ngOnDestroy(): void {
        this.pSubscriptions.unsubscribe();
    }

    onPaste(data: ClipboardEvent): void {
        data.stopPropagation();
        data.preventDefault();
        const clipboardData = data.clipboardData as DataTransfer;
        const pastedData = clipboardData.getData('Text');
        if (pastedData && pastedData.length > 4) {
            const val1 = parseInt(pastedData[0]);
            const val2 = parseInt(pastedData[1]);
            const val3 = parseInt(pastedData[2]);
            const val4 = parseInt(pastedData[3]);
            const val5 = parseInt(pastedData[4]);
            if (val1.toString() === pastedData[0] &&
                val2.toString() === pastedData[1] &&
                val3.toString() === pastedData[2] &&
                val4.toString() === pastedData[3] &&
                val5.toString() === pastedData[4]) {
                this.code1Field?.setValue(val1);
                this.code2Field?.setValue(val2);
                this.code3Field?.setValue(val3);
                this.code4Field?.setValue(val4);
                this.code5Field?.setValue(val5);
            }
        }
    }

    registerAccount(): void {
        this.onRegister.emit(this.email);
    }

    onSubmit(): void {
        this.done = true;
        const code = parseInt(this.codeField?.value) as number;
        if(this.transactionIdConfirmationCode && this.transactionIdConfirmationCode != ''){
            this.pSubscriptions.add(
                this.dataService.confirmQuickCheckout(this.transactionIdConfirmationCode, code).subscribe(({ data }) => {
                    this.onTransactionComplete.emit(data.executeTransaction as TransactionShort);
                }, (error) => {
                    this.done = false;
                    const errCode = this.errorHandler.getCurrentError();
                    if (errCode === 'auth.access_denied') {
                        this.onError.emit('Incorrect confirmation code');
                    } else {
                        this.onError.emit(this.errorHandler.getError(error.message, 'Incorrect confirmation code'));
                    }
                })
            );
        }else{
            this.pSubscriptions.add(
                this.auth.confirmCode(code, this.email).subscribe(({ data }) => {
                    this.onComplete.emit();
                }, (error) => {
                    this.done = false;
                    const errCode = this.errorHandler.getCurrentError();
                    if (errCode === 'auth.access_denied') {
                        this.onError.emit('Incorrect confirmation code');
                    } else {
                        this.onError.emit(this.errorHandler.getError(error.message, 'Incorrect confirmation code'));
                    }
                })
            );
        }
        
    }

    private onFormUpdated(): void {
        this.init = true;
    }

    private onCodeUpdated(val: string, codeIndex: number): void {
        const c1: string = this.code1Field?.value ?? '';
        const c2: string = this.code2Field?.value ?? '';
        const c3: string = this.code3Field?.value ?? '';
        const c4: string = this.code4Field?.value ?? '';
        const c5: string = this.code5Field?.value ?? '';
        const code = `${c1}${c2}${c3}${c4}${c5}`;
        this.codeField?.setValue(code);
        this.validData = code.length === 5;
        let focusInput: HTMLInputElement | undefined;
        if (codeIndex === 1) {
            focusInput = this.code2input?.nativeElement as HTMLInputElement;
        } else if (codeIndex === 2) {
            focusInput = this.code3input?.nativeElement as HTMLInputElement;
        } else if (codeIndex === 3) {
            focusInput = this.code4input?.nativeElement as HTMLInputElement;
        } else if (codeIndex === 4) {
            focusInput = this.code5input?.nativeElement as HTMLInputElement;
        }
        if (focusInput !== undefined) {
            setTimeout(() => {
                focusInput?.focus();
            }, 100);
        }
    }
}
