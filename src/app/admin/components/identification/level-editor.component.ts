import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, NgZone } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';
import { KycLevel } from 'src/app/model/identification.model';
import { UserTypeList } from 'src/app/model/payment.model';

@Component({
  selector: 'app-level-editor',
  templateUrl: 'level-editor.component.html',
  styleUrls: ['identification.component.scss']
})
export class LevelEditorComponent implements OnInit {
  @Input()
  set currentLevel(level: KycLevel | null) {
    this.setFormData(level);
    this.settingsId = (level !== null) ? level?.id : '';
  }

  @Input() create = false;
  @Output() save = new EventEmitter<KycLevel>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();
  @ViewChild('descriptionInput') descriptionInput!: CdkTextareaAutosize;

  private settingsId = '';
  private loadingData = false;
  errorMessage = '';

  userTypes = UserTypeList;

  levelForm = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    userType: ['', { validators: [Validators.required], updateOn: 'change' }],
    level: ['', { validators: [Validators.required], updateOn: 'change' }],
    flow: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  ngOnInit(): void {
    this.levelForm.valueChanges.subscribe({
      next: (result: any) => {
        if (!this.create && !this.loadingData) {
          this.formChanged.emit(true);
        }
      }
    });
  }

  constructor(private formBuilder: FormBuilder, private ngZone: NgZone) {
  }

  triggerResize(): void {
    // Wait for changes to be applied, then trigger textarea resize.
    this.ngZone.onStable.pipe(take(1))
        .subscribe(() => this.descriptionInput.resizeToFitContent(true));
  }

  setFormData(level: KycLevel | null): void {
    this.levelForm.reset();
    if (level !== null) {
      this.loadingData = true;
      this.levelForm.get('id')
          ?.setValue(level?.id);
      this.levelForm.get('name')
          ?.setValue(level?.name);
      this.levelForm.get('description')
          ?.setValue(level?.description);
      this.levelForm.get('userType')
          ?.setValue(level?.userType);
      this.levelForm.get('level')
          ?.setValue(level?.levelData.value);
      this.levelForm.get('flow')
          ?.setValue(level?.flowData.value);
      this.loadingData = false;
      this.formChanged.emit(false);
    } else {
      this.levelForm.get('id')
          ?.setValue('');
      this.levelForm.get('name')
          ?.setValue('');
      this.levelForm.get('description')
          ?.setValue('');
      this.levelForm.get('userType')
          ?.setValue('');
      this.levelForm.get('level')
          ?.setValue('');
      this.levelForm.get('flow')
          ?.setValue([]);
    }
  }

  setLevelData(): KycLevel {
    const data = new KycLevel(null);
    data.name = this.levelForm.get('name')?.value;
    data.description = this.levelForm.get('description')?.value;
    data.userType = this.levelForm.get('userType')?.value;
    data.levelData.value = this.levelForm.get('level')?.value;
    data.flowData.value = this.levelForm.get('flow')?.value;
    data.id = this.levelForm.get('id')?.value;
    return data;
  }

  onDeleteLevel(): void {
    this.delete.emit(this.settingsId);
  }

  onSubmit(): void {
    if (this.levelForm.valid) {
      this.save.emit(this.setLevelData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
