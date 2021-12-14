import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserType } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss']
})
export class CustomerDetailsComponent {
  @Input() set customer(val: UserItem | null) {
    this.setFormData(val);
    this.settingsId = (val) ? val?.id : '';
    this.email = (val) ? val.email : '';
    this.address = (val) ? val.address : '';
    this.userType = (val) ? val.userType?.id ?? UserType.Personal : UserType.Personal;
  }
  @Output() save = new EventEmitter<UserItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();

  settingsId = '';
  email = '';
  address = '';
  userType = UserType.Personal;
  loadingData = false;
  errorMessage = '';

  dataForm = this.formBuilder.group({
    id: [''],
    firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
    lastName: ['', { validators: [Validators.required], updateOn: 'change' }],
    country: ['', { validators: [Validators.required], updateOn: 'change' }],
    phone: ['', { validators: [Validators.required], updateOn: 'change' }],
    fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
    crypto: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(private formBuilder: FormBuilder) {
  }

  setFormData(data: UserItem | null): void {
    this.dataForm.reset();
    if (data !== null) {
      this.loadingData = true;
      this.dataForm.get('id')?.setValue(data?.id);
      this.dataForm.get('firstName')?.setValue(data?.firstName);
      this.dataForm.get('lastName')?.setValue(data?.lastName);
      this.dataForm.get('country')?.setValue(data?.country?.id);
      this.dataForm.get('phone')?.setValue(data?.phone);
      this.dataForm.get('fiat')?.setValue(data?.fiatCurrency);
      this.dataForm.get('crypto')?.setValue(data?.cryptoCurrency);
      this.loadingData = false;
      this.formChanged.emit(false);
    } else {
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('country')?.setValue('');
      this.dataForm.get('phone')?.setValue('');
      this.dataForm.get('fiat')?.setValue('');
      this.dataForm.get('crypto')?.setValue('');
    }
  }

  setCustomerData(): UserItem {
    const data = new UserItem(null);
    data.firstName = this.dataForm.get('firstName')?.value;
    data.lastName = this.dataForm.get('lastName')?.value;
    data.country = this.dataForm.get('country')?.value;
    data.phone = this.dataForm.get('phone')?.value;
    data.fiatCurrency = this.dataForm.get('fiat')?.value;
    data.cryptoCurrency = this.dataForm.get('crypto')?.value;
    data.id = this.dataForm.get('id')?.value;
    return data;
  }

  onDeleteCustomer(): void {
    this.delete.emit(this.settingsId);
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.save.emit(this.setCustomerData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
