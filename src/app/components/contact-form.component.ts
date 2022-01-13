import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: 'contact-form.component.html',
  styleUrls: ['../../assets/menu.scss', '../../assets/button.scss', '../../assets/text-control.scss']
})
export class ContactFormComponent {
  contactForm = this.formBuilder.group({
    name: ['', {validators: [Validators.required], updateOn: 'change'}],
    email: ['', {validators: [Validators.required, Validators.email], updateOn: 'change'}],
    title: ['', {validators: [Validators.required], updateOn: 'change'}],
    message: ['', {validators: [Validators.required], updateOn: 'change'}]
  });

  get nameField(): AbstractControl | null {
    return this.contactForm.get('name');
  }

  get emailField(): AbstractControl | null {
    return this.contactForm.get('email');
  }

  get titleField(): AbstractControl | null {
    return this.contactForm.get('title');
  }

  get messageField(): AbstractControl | null {
    return this.contactForm.get('message');
  }

  constructor(private formBuilder: FormBuilder) { }

  onSubmit(): void {

  }
}
