import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { TransactionType } from '../model/generated-models';
import { EnvService } from '../services/env.service';
import { getCryptoSymbol } from './utils';

const WAValidator = require('multicoin-address-validator');

export class WalletValidator {
    static addressValidator(addressField: string, currencyField: string, transactionField: string): ValidationErrors | null {
        return (fg: UntypedFormGroup) => {
            const addressControl = fg.controls[addressField];
            const currencyControl = fg.controls[currencyField];
            const transactionControl = fg.controls[transactionField];

            if (!addressControl || addressControl?.value?.length == 0 || addressControl?.value == '' || !currencyControl || !transactionControl) {
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
            currency = getCryptoSymbol(currency).toLowerCase();
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
