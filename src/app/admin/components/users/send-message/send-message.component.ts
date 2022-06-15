import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';
import { UserNotificationLevel } from 'src/app/model/generated-models';

export class UserMessageData {
  level: UserNotificationLevel = UserNotificationLevel.Info;
  title = '';
  text = '';
}

@Component({
  selector: 'app-admin-user-message-dialog',
  templateUrl: 'send-message.component.html',
  styleUrls: ['send-message.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminMessageDialogComponent {
  @Input() errorMessage = '';
  @Input() inProgress = false;
  @Output() send = new EventEmitter<UserMessageData>();
  @Output() close = new EventEmitter();

  submitted = false;
  
  messageForm = this.formBuilder.group({
    level: [UserNotificationLevel.Info, { validators: [Validators.required], updateOn: 'change' }],
    title: ['', { validators: [Validators.required], updateOn: 'change' }],
    text: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  get levelField(): AbstractControl | null {
    return this.messageForm.get('level');
  }

  get titleField(): AbstractControl | null {
    return this.messageForm.get('title');
  }

  get textField(): AbstractControl | null {
    return this.messageForm.get('text');
  }

  levels: CommonTargetValue[] = [
    { id: UserNotificationLevel.Request, title: 'Request', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Debug, title: 'Debug', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Info, title: 'Info', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Warning, title: 'Warning', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Error, title: 'Error', imgClass: '', imgSource: '' }
  ];

  constructor(
    private formBuilder: FormBuilder) { }

  onSubmit(): void {
    this.submitted = true;
    if (this.messageForm.valid) {
      this.send.emit({
        level: this.levelField?.value ?? UserNotificationLevel.Info,
        title: this.titleField?.value ?? '',
        text: this.textField?.value ?? ''
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
