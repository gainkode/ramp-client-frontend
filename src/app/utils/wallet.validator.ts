import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { TransactionType } from '../model/generated-models';
import { EnvService } from '../services/env.service';
import { getCryptoSymbol } from './utils';
import { CurrencyView } from 'model/payment.model';

const WAValidator = require('multicoin-address-validator');

export class WalletValidator {
	static addressValidator(
		addressField: string, 
		currencyField: string, 
		transactionField: string,
		currencies?: CurrencyView[]) {
		return (control: AbstractControl): { [key: string]: any; } => {
			const group = <UntypedFormGroup>control;
			const addressControl = group.controls[addressField];
			const currencyControl = group.controls[currencyField];
			const transactionControl = group.controls[transactionField];

			if (!addressControl || addressControl?.value?.length === 0 || addressControl?.value === '' || !currencyControl || !transactionControl) {
				return null;
			}
			if (transactionControl.value !== TransactionType.Buy) {
				return null;
			}
			if (!addressControl.value || !currencyControl.value) {
				return null;
			}
			const address = addressControl.value as string;
			let currency = currencyControl.value as string;
			if (address === '') {
				return null;
			}
			// valid BTC wallet: 1KFzzGtDdnq5hrwxXGjwVnKzRbvf8WVxck
			const currencyAsSymbol = currencies?.find(c => c.symbol === currency)?.validateAsSymbol;

			currency = getCryptoSymbol(currencyAsSymbol ?? currency).toLowerCase();
			
			const networkType = EnvService.test_wallets ? 'both' : 'prod';
			const valid = WAValidator.validate(address, currency, networkType);
	
			if (valid) {
				return null;
			} else {
				addressControl.setErrors({
					...addressControl.errors,
					...{ walletAddress: true }
				});
				return { walletAddress: true };
			}
		};
	}
}