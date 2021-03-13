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
                result = 'Incorrect login or password';
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
                result = 'Invalid password format';
                break;
            case 'auth.login_invalid':
                result = 'Invalid login format';
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
            case 'core.insufficient_funds':
                result = 'Insufficient funds';
                break;
            case 'core.fetch_address_balance_error':
                result = 'Unable to fetch balance';
                break;
            case 'core.liquidity_crypto_not_supported':
                result = 'Liquidity crypto is not supported';
                break;
            case 'core.liquidity_create_order_error':
                result = 'Unable to create a new order';
                break;
            case 'core.liquidity_fetch_crypto_rate_error':
                result = 'Crypto rate error';
                break;
            case 'core.liquidity_fetch_order_status_error':
                result = 'Unable to get order status';
                break;
            case 'core.kyc_create_applicant_error':
                result = 'Unable to create a new applicant';
                break;
            case 'core.kyc_add_document_error':
                result = 'Document upload error';
                break;
            case 'core.kyc_get_applicant_information_error':
                result = 'Unable to get applicant information';
                break;
            default:
                if (code !== '') {
                    result = code;
                }
                break;
        }
        return result;
    }
}
