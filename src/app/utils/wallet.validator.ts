import { FormGroup } from "@angular/forms";

const WAValidator = require('multicoin-address-validator');

export class WalletValidator {
    static addressValidator(addressField: string, currencyField: string) {
        return (fg: FormGroup) => {
            const addressControl = fg.controls[addressField];
            const currencyControl = fg.controls[currencyField];

            if (!addressControl) {
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
