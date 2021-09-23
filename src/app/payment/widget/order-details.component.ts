import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetOrderDetailsComponent implements OnInit {
  // @Input() title = '';
  // @Input() set step(val: number) {
  //   this.position = val;
  //   if (this.position < 1) {
  //     this.position = 1;
  //   } else if (this.position > 6) {
  //     this.position = 6;
  //   }
  // }

  emailErrorMessages: {[key: string]: string;} = {
    ['email']: 'Email is not valid',
    ['required']: 'Email is required'
  };

  dataForm = this.formBuilder.group({
    email: [null, {
      validators: [Validators.email], updateOn: 'change'
    }]
  });

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    
  }

  onSubmit(): void {
    this.emailField?.setValidators([Validators.email, Validators.required]);
    this.emailField?.updateValueAndValidity();
    console.log('email', this.emailField?.value, this.emailField?.valid ? 'valid' : 'invalid');
  }
}
