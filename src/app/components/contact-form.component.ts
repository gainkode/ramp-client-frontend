import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Feedback, FeedbackInput } from '../model/generated-models';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { CommonDialogBox } from './dialogs/common-box.dialog';

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

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private errorHandler: ErrorService) { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private showSuccessDialog(message: string): void {
    this.dialog.open(CommonDialogBox, {
      width: '450px',
      data: {
        title: 'Success',
        message: message
      }
    });
  }

  private showFailDialog(message: string): void {
    this.dialog.open(CommonDialogBox, {
      width: '450px',
      data: {
        title: 'Error',
        message: message
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.inProgress = true;
      const feedback: FeedbackInput = {
        name: this.nameField?.value,
        email: this.emailField?.value,
        title: this.titleField?.value,
        description: this.messageField?.value
      };
      this.subscriptions.add(
        this.auth.addFeedback(feedback).subscribe(({ data }) => {
          this.inProgress = false;
          const userData = data.addFeedback as Feedback;
          if (userData.feedbackId) {
            this.contactForm.reset();
            this.showSuccessDialog('Your message has been successfully sent.');
          } else {
            this.showFailDialog('Unable to send the message.');
          }
        }, (error) => {
          this.inProgress = false;
          this.showFailDialog(this.errorHandler.getError(error.message, 'Unable to send the message.'));
        })
      );
    }
  }
}
