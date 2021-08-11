import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ContactItem } from 'src/app/model/user.model';

@Component({
    selector: 'app-profile-contact-editor',
    templateUrl: 'profile-contact-editor.component.html',
    styleUrls: ['./profile.scss']
})
export class ProfileContactEditorComponent implements OnInit {
    @Input()
    set currentContact(contact: ContactItem | null) {
        this.setFormData(contact);
    }
    @Input() create = false;
    @Output() save = new EventEmitter<ContactItem>();
    @Output() delete = new EventEmitter<string>();
    @Output() cancel = new EventEmitter();
    @Output() formChanged = new EventEmitter<boolean>();
    @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    errorMessage = '';

    contactForm = this.formBuilder.group({
        id: [''],
        displayName: ['', { validators: [Validators.required], updateOn: 'change' }],
        contactEmail: [
            '',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
                ],
                updateOn: 'change',
            }
        ]
    });

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
    }

    setFormData(contact: ContactItem | null): void {
        this.contactForm.reset();
        if (contact !== null) {
            this.contactForm.get('id')?.setValue(contact?.id);
            this.contactForm.get('name')?.setValue(contact?.userId);
            this.contactForm.get('displayName')?.setValue(contact?.displayName);
            this.contactForm.get('contactEmail')?.setValue(contact?.contactEmail);
            this.formChanged.emit(false);
        } else {
            this.contactForm.get('id')?.setValue('');
            this.contactForm.get('name')?.setValue('');
            this.contactForm.get('displayName')?.setValue('');
            this.contactForm.get('contactEmail')?.setValue('');
        }
    }

    setContactData(): ContactItem {
        const data = new ContactItem(null);
        data.id = this.contactForm.get('id')?.value;
        data.userId = this.contactForm.get('userId')?.value;
        data.displayName = this.contactForm.get('displayName')?.value;
        data.contactEmail = this.contactForm.get('contactEmail')?.value;
        return data;
    }

    onDeleteScheme(): void {
        this.delete.emit(this.contactForm.get('id')?.value);
    }

    onSubmit(): void {
        if (this.contactForm.valid) {
            console.log('submit');
            this.save.emit(this.setContactData());
        } else {
            this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
