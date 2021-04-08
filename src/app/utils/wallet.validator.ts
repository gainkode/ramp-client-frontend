import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

//import walletAddressValidatorMinJs from '@swyftx/api-crypto-address-validator/dist/wallet-address-validator.min.js'

//const WAValidator = require('multicoin-address-validator');

//const { Readable } = require('stream');

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
            currency = currency.toLowerCase();

            let valid = true;
        
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
