import { FormGroup, ValidationErrors } from "@angular/forms";

const WAValidator = require('multicoin-address-validator');

export class WalletValidator {
    static addressValidator(addressField: string, currencyField: string): ValidationErrors | null {
        return (fg: FormGroup) => {
            const addressControl = fg.controls[addressField];
            const currencyControl = fg.controls[currencyField];

            if (!addressControl || !currencyControl) {
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
            currency = currency.toLowerCase();
            let valid = WAValidator.validate(address, currency);
            if (valid) {
                return null;
            } else {
                addressControl.setErrors({
                    ...addressControl.errors,
                    ...{ walletAddress: true }
                });
                return { walletAddress: true };
            }
        }
    }
}
