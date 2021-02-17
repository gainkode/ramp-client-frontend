import { Injectable } from '@angular/core';

@Injectable()
export class ErrorService {
    getError(code: string, defaultMessage: string): string {
        let result = defaultMessage;
        switch (code.toLowerCase()) {
            // Common error codes (0 - 50)
            case 'success':
                result = 'Success';
                break;
            case 'common.internal_server_error':
                result = 'Internal server error';
                break;
            case 'common.argument_invalid':
                result = 'Invalid argument';
                break;
            case 'common.timeout':
                result = 'Request is timed out';
                break;
            case 'common.too_many_resolvers':
                result = 'Internal server error';
                break;
            case 'core.file_not_found':
                result = 'Specified file is not found';
                break;
            // Authentication error codes (51 - 100)
            case 'auth.recaptcha_invalid':
                result = 'INvalid recaptcha data';
                break;
            case 'auth.token_invalid':
                result = 'Token value is invalid';
                break;
            case 'auth.access_denied':
                result = 'Wrong login or password';
                break;
            case 'auth.unconfirmed_email':
                result = 'User email is not confirmed';
                break;
            case 'auth.unconfirmed_device':
                result = 'User device is not confirmed';
                break;
            case 'auth.user_already_exists':
                result = 'This user account already exists';
                break;
            case 'auth.alias_already_exists':
                result = 'This alias already exists';
                break;
            case 'auth.password_invalid':
                result = 'Wrong password format';
                break;
            case 'auth.login_invalid':
                result = 'Wrong login format';
                break;
            case 'auth.referral_code_invalid':
                result = 'Referral code is invalid';
                break;
            case 'auth.2fa_already_enabled':
                result = 'Two-factor authentication is already enabled';
                break;
            case 'auth.2fa_already_disabled':
                result = 'Two-factor authentication is already disabled';
                break;
            case 'auth.password_has_to_be_changed':
                result = 'Change your password';
                break;
            case 'auth.two_factor_code_invalid':
                result = 'Wrong format of the two-factor code';
                break;
            case 'auth.terms_of_use_are_not_accepted':
                result = 'Terms of use are not accepted';
                break;
            // User error codes (101 - 150)
            case 'user.not_found':
                result = 'Specified user is not found';
                break;
            case 'user.kyc_data_invalid':
                result = 'Wrong KYC data';
                break;
            case 'user.kyc_upload_file_error':
                result = 'Unable to upload KYC file';
                break;
            case 'user.transfer_data_invalid':
                result = 'Wrong tranfer data';
                break;
            case 'user.update_user_data_error':
                result = 'Wrong user data for update';
                break;
        }
        return result;
    }
}