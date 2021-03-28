import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { KycLevel } from 'src/app/model/identification.model';

@Component({
    selector: 'level-editor',
    templateUrl: 'level-editor.component.html',
    styleUrls: ['../admin.scss', 'identification.component.scss']
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

    private settingsId = '';
    private loadingData = false;
    errorMessage = '';

    levelForm = this.formBuilder.group({
        id: [''],
        name: ['', { validators: [Validators.required], updateOn: 'change' }],
        levelDescription: [''],
        levelValue: ['', { validators: [Validators.required], updateOn: 'change' }],
        flowDescription: [''],
        flowValue: ['', { validators: [Validators.required], updateOn: 'change' }],
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

    constructor(private formBuilder: FormBuilder) { }

    setFormData(level: KycLevel | null): void {
        this.levelForm.reset();
        if (level !== null) {
            this.loadingData = true;
            this.levelForm.get('id')?.setValue(level?.id);
            this.levelForm.get('name')?.setValue(level?.name);
            this.levelForm.get('levelDescription')?.setValue(level?.levelData.description);
            this.levelForm.get('levelValue')?.setValue(level?.levelData.value);
            this.levelForm.get('flowDescription')?.setValue(level?.flowData.description);
            this.levelForm.get('flowValue')?.setValue(level?.flowData.value);
            this.loadingData = false;
            this.formChanged.emit(false);
        } else {
            this.levelForm.get('id')?.setValue('');
            this.levelForm.get('name')?.setValue('');
            this.levelForm.get('levelDescription')?.setValue('');
            this.levelForm.get('levelValue')?.setValue('');
            this.levelForm.get('flowDescription')?.setValue('');
            this.levelForm.get('flowValue')?.setValue([]);
        }
    }

    setLevelData(): KycLevel {
        const data = new KycLevel(null);
        data.name = this.levelForm.get('name')?.value;
        data.levelData.description = this.levelForm.get('levelDescription')?.value;
        data.levelData.value = this.levelForm.get('levelValue')?.value;
        data.levelData.name = 'Level name';
        data.flowData.description = this.levelForm.get('flowDescription')?.value;
        data.flowData.value = this.levelForm.get('flowValue')?.value;
        data.flowData.name = 'Flow name';
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
