import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { from, Observable } from 'rxjs';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { LoginResult, PostAddress, SettingsCommon, User, UserMode, UserType } from '../model/generated-models';
import { environment } from 'src/environments/environment';
import { EmptyObject } from 'apollo-angular/types';

const LOGIN = gql`
  mutation Login($recaptcha: String!, $email: String!, $password: String, $quickCheckout: Boolean) {
      login(
          recaptcha: $recaptcha,
          email: $email,
          password: $password,
          quickCheckout: $quickCheckout) {
              authToken
              user {
                  userId
                  email
                  roles {name, immutable}
                  permissions { roleName, objectCode, objectName, objectDescription, fullAccess }
                  type,
                  defaultFiatCurrency,
                  firstName,
                  lastName,
                  birthday,
                  countryCode2,
                  countryCode3,
                  phone,
                  postCode,
                  town,
                  street,
                  subStreet,
                  stateName,
                  buildingName,
                  buildingNumber,
                  flatNumber,
                  addressStartDate,
                  addressEndDate,
                  mode,
                  is2faEnabled,
                  changePasswordRequired,
                  referralCode,
                  kycProvider,
                  kycApplicantId,
                  kycValid,
                  kycStatus,
                  kycStatusUpdateRequired,
                  kycReviewRejectedType
            }
            authTokenAction
        }
    }
`;

const REFRESH_TOKEN = gql`
  mutation RefreshToken { refreshToken }
`;

const SOCIAL_LOGIN = gql`
mutation SocialLogin(
    $recaptcha: String!,
    $oauthtoken: String!,
    $oauthprovider: OAuthProvider!) {
        login(
            recaptcha: $recaptcha,
            oAuthProvider: $oauthprovider,
            oAuthToken: $oauthtoken) {
                authToken
                user {
                    userId,
                    email,
                    roles {name, immutable},
                    permissions { roleName, objectCode, objectName, objectDescription, fullAccess },
                    type,
                    defaultFiatCurrency,
                    firstName,
                    lastName,
                    birthday,
                    countryCode2,
                    countryCode3,
                    phone,
                    postCode,
                    town,
                    street,
                    subStreet,
                    stateName,
                    buildingName,
                    buildingNumber,
                    flatNumber,
                    addressStartDate,
                    addressEndDate,
                    mode,
                    is2faEnabled,
                    changePasswordRequired,
                    referralCode,
                    kycProvider,
                    kycApplicantId,
                    kycValid,
                    kycStatus,
                    kycStatusUpdateRequired,
                    kycReviewRejectedType,
                }
                authTokenAction
            }
    }
`;

const SIGNUP = gql`
  mutation Signup($recaptcha: String!, $email: String!, $password: String!, $userType: UserType!,
    $mode: UserMode!, $termsOfUse: Boolean!) {
    signup(
        recaptcha: $recaptcha,
        email: $email,
        password: $password,
        type: $userType,
        mode: $mode,
        termsOfUse: $termsOfUse
    ) {
      authToken
      user {
        userId,
        email,
        countryCode2,
        countryCode3
      }
      authTokenAction
    }
  }
`;

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!, $recaptcha: String!) {
    forgotPassword(recaptcha: $recaptcha, email: $email)
  }
`;

const SET_PASSWORD = gql`
  mutation SetPassword($token: String!, $password: String!, $recaptcha: String!) {
    setPassword(recaptcha: $recaptcha, password: $password, token: $token)
  }
`;

const CONFIRM_EMAIL = gql`
  mutation ConfirmEmail($token: String!, $recaptcha: String!) {
    confirmEmail(recaptcha: $recaptcha, token: $token)
  }
`;

const CONFIRM_NAME = gql`
  mutation ConfirmName($token: String!, $recaptcha: String!,
    $userType: UserType!, $mode: UserMode!, $firstName: String!, $lastName: String!,
    $countryCode2: String!, $countryCode3: String!, $phone: String!) {
    confirmName(
        recaptcha: $recaptcha,
        token: $token,
        type: $userType,
        mode: $mode,
        firstName: $firstName,
        lastName: $lastName,
        countryCode2: $countryCode2,
        countryCode3: $countryCode3,
        phone: $phone
    ) {
      authToken
      user {
        userId,
        email,
        type,
        roles {name,immutable},
        permissions { roleName, objectCode, objectName, objectDescription, fullAccess },
        defaultFiatCurrency,
        firstName,
        lastName,
        phone,
        mode,
        kycApplicantId,
        kycStatus
      }
      authTokenAction
    }
  }
`;

const SET_MY_INFO = gql`
mutation SetMyInfo(
    $recaptcha: String!,
    $firstName: String
    $lastName: String,
    $phone: String,
    $address: PostAddress,
    $birthday: DateTime) {
    setMyInfo(recaptcha: $recaptcha, firstName: $firstName, lastName: $lastName, phone: $phone, address: $address, birthday: $birthday) {
        authToken
        user {
            userId,
            email,
            roles {name, immutable},
            permissions { roleName, objectCode, objectName, objectDescription, fullAccess },
            type,
            defaultFiatCurrency,
            firstName,
            lastName,
            birthday,
            countryCode2,
            countryCode3,
            phone,
            postCode,
            town,
            street,
            subStreet,
            stateName,
            buildingName,
            buildingNumber,
            flatNumber,
            addressStartDate,
            addressEndDate,
            mode,
            is2faEnabled,
            changePasswordRequired,
            referralCode,
            kycProvider,
            kycApplicantId,
            kycValid,
            kycStatus,
            kycStatusUpdateRequired,
            kycReviewRejectedType,
        }
        authTokenAction
    }
}
`;

const GENERATE_2FA_CODE = gql`
mutation Generate2faCode {
    generate2faCode {
        otpauthUrl, code
    }
}
`;

const ENABLE_2FA = gql`
mutation Enable2fa($password: String!, $code: String!) {
    enable2fa(password: $password, code: $code) {
        user {
            is2faEnabled
        }
    }
}
`;

const DISABLE_2FA = gql`
mutation Disable2fa($password: String!, $code: String!) {
    disable2fa(password: $password, code: $code) {
        user {
            is2faEnabled
        }
    }
}
`;

const VERIFY_2FA = gql`
mutation Verify2faCode($code: String!) {
    verify2faCode(code: $code) {
        authToken
        user {
            userId,
            email,
            roles {name, immutable},
            permissions { roleName, objectCode, objectName, objectDescription, fullAccess },
            type,
            defaultFiatCurrency,
            firstName,
            lastName,
            phone,
            mode,
            is2faEnabled,
            changePasswordRequired,
            referralCode,
            kycProvider,
            kycApplicantId,
            kycValid,
            kycStatus,
            kycStatusUpdateRequired,
            kycReviewRejectedType
        }
        authTokenAction
    }
}
`;

const GET_SETTINGS_COMMON = gql`
query {
    getSettingsCommon {
        liquidityProvider
        custodyProvider
        kycProvider
        kycBaseAddress
    }
  }
`;

const GET_KYC_TOKEN = gql`
query { generateWebApiToken }
`;

const MY_KYC_STATUS = gql`
query { myKycStatus }
`;

const ME_KYC = gql`
query {
    me {
        kycValid,
        kycStatus,
        kycReviewRejectedType
    }
}
`;

const GET_MY_SETTINGS_KYC = gql`
query {
    mySettingsKyc {
        levels {
            settingsKycLevelId,
            name,
            data,
            description,
            order
        }
    }
}
`;

const GET_SIGNUP_REQUIRED_FIELDS = gql`
query {
    mySettingsKyc {
        requireUserFullName
        requireUserPhone
        requireUserBirthday
        requireUserAddress
        requireUserFlatNumber
    }
}
`;

@Injectable()
export class AuthService {
    get authenticated(): boolean {
        return this.token !== '';
    }

    get user(): User | null {
        let user: User | null = null;
        const userStr = sessionStorage.getItem('currentUser');
        if (userStr !== null) {
            user = JSON.parse(userStr);
        }
        return user;
    }

    get token(): string {
        const tokenData: string | null = sessionStorage.getItem('currentToken');
        return (tokenData === null) ? '' : tokenData;
    }

    constructor(private apollo: Apollo, private socialAuth: SocialAuthService) { }

    refreshToken(): Observable<any> {
        const result = this.apollo.mutate({
            mutation: REFRESH_TOKEN
        });
        result.subscribe(x => {
            const d = x.data as any;
            console.log('refresh token: ', d.refreshToken);
            sessionStorage.setItem('currentToken', d.refreshToken as string);
        }, (error) => {
            console.log('refresh token error: ', error);
        });
        return result;
    }

    getUserMainPage(): string {
        let result = '/';
        const u = this.user;
        if (u !== null) {
            if (u.mode === UserMode.InternalWallet) {
                if (u.type === 'Personal') {
                    result = '/personal/main';
                } else if (u.type === 'Merchant') {
                    result = '/merchant/main';
                }
            }
        }
        return result;
    }

    authenticate(username: string, userpassword: string, quickCheckout: boolean = false): Observable<any> {
        return this.apollo.mutate({
            mutation: LOGIN,
            variables: {
                recaptcha: environment.recaptchaId,
                email: username,
                password: quickCheckout ? null : userpassword,
                quickCheckout
            }
        });
    }

    authenticateSocial(provider: string, token: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SOCIAL_LOGIN,
            variables: {
                recaptcha: environment.recaptchaId,
                oauthprovider: provider,
                oauthtoken: token
            }
        });
    }

    socialSignIn(provider: string): Observable<any> {
        let providerId = '';
        if (provider.toLowerCase() === 'google') {
            providerId = GoogleLoginProvider.PROVIDER_ID;
        } else if (provider.toLowerCase() === 'facebook') {
            providerId = FacebookLoginProvider.PROVIDER_ID;
        }
        return from(
            this.socialAuth.signIn(providerId).then(function (data) {
                return { user: data, error: undefined };
            }).catch(function (data) {
                return { user: undefined, error: data };
            })
        );
    }

    register(usermail: string, userpassword: string, usertype: UserType): Observable<any> {
        return this.apollo.mutate({
            mutation: SIGNUP,
            variables: {
                recaptcha: environment.recaptchaId,
                email: usermail,
                password: userpassword,
                userType: usertype,
                mode: 'InternalWallet',
                termsOfUse: true
            }
        });
    }

    confirmName(
        tokenId: string,
        usertype: string,
        firstname: string,
        lastname: string,
        countrycode2: string,
        countrycode3: string,
        phoneNumber: string): Observable<any> {
        return this.apollo.mutate({
            mutation: CONFIRM_NAME,
            variables: {
                token: tokenId,
                recaptcha: environment.recaptchaId,
                userType: usertype,
                mode: 'InternalWallet',
                firstName: firstname,
                lastName: lastname,
                countryCode2: countrycode2,
                countryCode3: countrycode3,
                phone: phoneNumber
            }
        });
    }

    forgotPassword(usermail: string): Observable<any> {
        return this.apollo.mutate({
            mutation: FORGOT_PASSWORD,
            variables: {
                recaptcha: environment.recaptchaId,
                email: usermail
            }
        });
    }

    setPassword(usertoken: string, userpassword: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SET_PASSWORD,
            variables: {
                recaptcha: environment.recaptchaId,
                token: usertoken,
                password: userpassword
            }
        });
    }

    confirmEmail(tokenValue: string): Observable<any> {
        return this.apollo.mutate({
            mutation: CONFIRM_EMAIL,
            variables: {
                recaptcha: environment.recaptchaId,
                token: tokenValue
            }
        });
    }

    setMyInfo(
        firstNameValue: string,
        lastNameValue: string,
        phoneValue: string,
        addressValue: PostAddress | undefined,
        birthdayValue: Date | undefined): Observable<any> {
        const vars = {
            recaptcha: environment.recaptchaId,
            firstName: (firstNameValue === '') ? undefined : firstNameValue,
            lastName: (lastNameValue === '') ? undefined : lastNameValue,
            phone: (phoneValue === '') ? undefined : phoneValue,
            address: addressValue,
            birthday: birthdayValue
        };
        console.log('birthdayValue', birthdayValue);
        console.log('vars', vars);
            
        return this.apollo.mutate({
            mutation: SET_MY_INFO,
            variables: vars
        });
    }

    generate2FaCode(): Observable<any> {
        return this.apollo.mutate({
            mutation: GENERATE_2FA_CODE
        });
    }

    enable2Fa(authCode: string): Observable<any> {
        return this.apollo.mutate({
            mutation: ENABLE_2FA,
            variables: {
                password: 'ignored',
                code: authCode
            }
        });
    }
    
    disable2Fa(authCode: string): Observable<any> {
        return this.apollo.mutate({
            mutation: DISABLE_2FA,
            variables: {
                password: 'ignored',
                code: authCode
            }
        });
    }

    verify2Fa(code: string): Observable<any> {
        return this.apollo.mutate({
            mutation: VERIFY_2FA,
            variables: {
                code
            }
        });
    }

    setLoginUser(login: LoginResult): void {
        sessionStorage.setItem('currentUser', JSON.stringify(login.user));
        sessionStorage.setItem('currentToken', login.authToken as string);
    }

    setLocalSettingsCommon(settings: SettingsCommon): void {
        sessionStorage.setItem('common', JSON.stringify(settings));
    }

    getLocalSettingsCommon(): SettingsCommon | null {
        let settings: SettingsCommon | null = null;
        const str = sessionStorage.getItem('common');
        if (str !== null) {
            settings = JSON.parse(str);
        }
        return settings;
    }

    private getAuthenticatedUser(): User | null {
        let result: User | null = null;
        const userData: string | null = sessionStorage.getItem('currentUser');
        if (userData !== null) {
            result = JSON.parse(userData as string) as User;
        }
        return result;
    }

    isMerchantApproved(): boolean {
        let result = false;
        const user: User | null = this.getAuthenticatedUser();
        if (user !== null) {
            result = (user.type === UserType.Merchant && user.kycValid === true);
        }
        return result;
    }

    isAuthenticatedUserType(type: string): boolean {
        let result = false;
        const user: User | null = this.getAuthenticatedUser();
        if (user !== null) {
            result = (user.type === type);
        }
        return result;
    }

    isAuthenticatedUserRole(role: string): boolean {
        let result = false;
        const user: User | null = this.getAuthenticatedUser();
        if (user != null) {
            const roleItem = (user.roles?.find(x => x.name?.toLowerCase() === role));
            if (roleItem !== undefined) {
                result = true;
            }
        }
        return result;
    }

    /*
    Get info, whether the current user has permissions to the page with specified code.
    If permission is found, function returns access rights: 1 - read only access, 2 - full access.
    If permissions not found, function returns 0
     */
    isPermittedObjectCode(code: string): number {
        let result = 0;
        const user: User | null = this.getAuthenticatedUser();
        if (user != null) {
            const permissionItem = (user.permissions?.find(x => x.objectCode === code));
            if (permissionItem !== undefined) {
                result = (permissionItem.fullAccess) ? 2 : 1;
            }
        }
        return result;
    }

    getSettingsCommon(): QueryRef<any, EmptyObject> {
        return this.apollo.watchQuery<any>({
            query: GET_SETTINGS_COMMON,
            fetchPolicy: 'network-only'
        });
    }

    getMyKycSettings(): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            return this.apollo.watchQuery<any>({
                query: GET_MY_SETTINGS_KYC,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }

    getSignupRequiredFields(): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            return this.apollo.watchQuery<any>({
                query: GET_SIGNUP_REQUIRED_FIELDS,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }

    getKycToken(): QueryRef<any, EmptyObject> {
        return this.apollo.watchQuery<any>({
            query: GET_KYC_TOKEN,
            fetchPolicy: 'network-only'
        });
    }

    getMyKycStatus(): QueryRef<any, EmptyObject> {
        return this.apollo.watchQuery<any>({
            query: MY_KYC_STATUS,
            fetchPolicy: 'network-only'
        });
    }

    getMyKycData(): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            return this.apollo.watchQuery<any>({
                query: ME_KYC,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }

    socialSignOut(): void {
        this.socialAuth.signOut().then(function (data) { }).catch(function (error) { });
    }

    logout(): void {
        this.apollo.client.resetStore();
        sessionStorage.removeItem('currentToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('common');
    }
}
