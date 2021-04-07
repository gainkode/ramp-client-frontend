import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

//const WAValidator = require('multicoin-address-validator');

export class WalletValidator {
    static addressValidator(addressField: string, currencyField: string) {
        return (fg: FormGroup) => {
            const addressControl = fg.controls[addressField];
            const currencyControl = fg.controls[currencyField];

            if (!addressControl) {
                return null;
            }
            const address = addressControl.value;
            if (address === '') {
                return null;
            }
        
            if (address === 'addr') {
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
