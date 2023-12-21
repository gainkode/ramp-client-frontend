import { Component, Input, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, FormControl } from '@angular/forms';
import { CurrencyView } from 'model/payment.model';
import { Observable, map, startWith } from 'rxjs';
import { ThemeService } from 'services/theme-service';

@Component({
	selector: 'app-widget-input-group',
	templateUrl: './widget-input-group.component.html',
	styleUrls: ['./widget-input-group.component.scss'],
	viewProviders: [
		{
			provide: ControlContainer,
			useFactory: (controlContainer: ControlContainer) => controlContainer,
			deps: [[new SkipSelf(), ControlContainer]],
		},
	],
})
export class WidgetInputGroupComponent {
  @Input() label = '';
  @Input() smallLabel = false;
  @Input() assist = '';
  @Input() placeholder = '...';
  @Input() boxFieldName = '';
  @Input() comboFieldName = '';
  @Input() boxField: AbstractControl | null = null;
  @Input() comboField: AbstractControl | null = null;
  @Input() comboList: CurrencyView[] = [];
  @Input() errorMessages: {
  	[key: string]: string;
  } = {};
  @Input() set active(val: boolean) {
  	this.textBoxEnabled = val;
  	if (val === false) {
  		this.boxField?.disable();
  		this.comboField?.disable();
  	} else {
  		this.boxField?.enable();
  		this.comboField?.enable();
  	}
  }
  @Input() separator = false;

  get active(): boolean {
  	return this.textBoxEnabled;
  }

  showCurrencyList = false;

  private textBoxEnabled = true;

  get invalidForm(): boolean {
  	return this.boxField?.errors ? true : false;
  }

  get errorAssist(): string {
  	let result = '';
  	const errors = this.boxField?.errors;
  	if (errors != null) {
  		Object.keys(errors).forEach((error) => {
  			const msg = this.errorMessages[error];
  			if (msg) {
  				result = msg;
  				return;
  			}
  		});
  	}
  	return result;
  }

  get selectedComboValue(): CurrencyView | undefined {
  	return this.comboList.find((x) => x.symbol === this.comboField?.value);
  }

  searchCurrencyControl = new FormControl();
  filteredItems: Observable<CurrencyView[]>;

  constructor(public themeService: ThemeService) {

  	this.filteredItems = this.searchCurrencyControl.valueChanges.pipe(
  		startWith(''),
  		map(value => this._filter(value))
	  );
  }

  onCurrencySelect(value: string): void {
  	this.showCurrencyList = false;
  	this.comboField?.setValue(value);
  }

  private _filter(value: string): CurrencyView[] {
  	const filterValue = value.toLowerCase();
  	return this.comboList.filter(item => item.display.toLowerCase().includes(filterValue));
  }
}

