import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Feedback, FeedbackInput } from '../model/generated-models';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: 'contact-form.component.html',
  styleUrls: ['../../assets/menu.scss', '../../assets/button.scss', '../../assets/dialog.scss', '../../assets/text-control.scss']
})
export class ContactFormComponent implements OnDestroy {
  inProgress = false;

  contactForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    email: ['', { validators: [Validators.required, Validators.email], updateOn: 'change' }],
    title: ['', { validators: [Validators.required], updateOn: 'change' }],
    message: ['', { validators: [Validators.required], updateOn: 'change' }]
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

  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, private auth: AuthService) { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.inProgress = true;
      const feedback: FeedbackInput = {
        title: this.titleField?.value,
        description: this.messageField?.value
      };
      this.subscriptions.add(
        this.auth.addFeedback(feedback).subscribe(({ data }) => {
          this.inProgress = false;
          const userData = data.addFeedback as Feedback;
          if (userData.feedbackId) {
            alert('Success');
          } else {
            alert('Oops');
          }
        }, (error) => {
          this.inProgress = false;
          alert('Error');
        })
      );
    }
  }
}
