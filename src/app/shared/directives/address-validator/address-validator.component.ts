import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { EnvService } from 'services/env.service';
import { getCryptoSymbol } from 'utils/utils';
const WAValidator = require('multicoin-address-validator');

@Directive({
	selector: '[appAddressValidator]'
})
export class AddressValidatorDirective {
	@Input() elCurrency: string;
	@Input() elRequired: boolean;

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	@HostListener('input') onInputChange(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const value = input.value;

		if (!value && !this.elRequired) {
			this.clearError();
			return;
		}

		if (value && this.elCurrency) {
			const currencyNew = getCryptoSymbol(this.elCurrency).toLowerCase();
			const currencyExist = WAValidator.findCurrency(currencyNew);

			if (currencyExist) {
				const networkType = EnvService.test_wallets ? 'both' : 'prod';
				const isAddressValid = WAValidator.validate(value, currencyNew, networkType);

				if (!isAddressValid) {
					this.showError();
				} else {
					this.clearError();
				}
			} else {
				this.clearError();
			}
		}
  }

  private showError(): void {
    const input = this.el.nativeElement as HTMLInputElement;

    this.renderer.setStyle(input, 'border', '1px solid red');
		this.renderer.setAttribute(this.el.nativeElement, 'data-error', 'ERROR');
  }

  private clearError(): void{
    const input = this.el.nativeElement as HTMLInputElement;

    this.renderer.removeStyle(input, 'border');
		this.renderer.removeAttribute(this.el.nativeElement, 'data-error');
  }
}
