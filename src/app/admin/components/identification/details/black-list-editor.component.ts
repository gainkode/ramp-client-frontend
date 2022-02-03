import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';
import { CountryFilterList } from 'src/app/model/country-code.model';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-black-list-editor',
  templateUrl: 'black-list-editor.component.html',
  styleUrls: ['black-list-editor.component.scss', '../tab-list/identification-list.component.scss']
})
export class BlackListEditorComponent {
  @Input()
  set currentCountry(item: CommonTargetValue | null) {
    this.setFormData(item);
    this.settingsId = (item !== null) ? item?.id : '';
    if (item !== null) {
      this.selectedItem = item;
    }
    this.layoutService.setBackdrop(!this.settingsId);
  }

  @Input() create = false;
  @Output() save = new EventEmitter<CommonTargetValue>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();

  selectedItem: CommonTargetValue = {} as CommonTargetValue;
  private settingsId = '';

  errorMessage = '';
  dataList = CountryFilterList;

  dataForm = this.formBuilder.group({
    id: ['']
  });

  constructor(
    private formBuilder: FormBuilder,
    private layoutService: LayoutService) {
  }

  setFormData(item: CommonTargetValue | null): void {
    this.dataForm.reset();
    if (item !== null) {
      this.dataForm.get('id')?.setValue(item?.id);
    } else {
      this.dataForm.get('id')?.setValue('');
    }
  }

  setSchemeData(): CommonTargetValue | undefined {
    const id = this.dataForm.get('id')?.value ?? '';
    return this.dataList.find(x => x.id === id);
  }

  onDeleteItem(): void {
    this.delete.emit(this.settingsId);
  }

  onSubmit(): void {
    const data = this.setSchemeData();
    if (this.dataForm.valid && data) {
      this.save.emit(data);
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
