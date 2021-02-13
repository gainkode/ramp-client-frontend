export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Byte: any;
  Upload: any;
};




export type Query = {
  __typename?: 'Query';
  serverTime: Scalars['String'];
  me: User;
  user?: Maybe<User>;
  userCount?: Maybe<Scalars['Int']>;
  userById: User;
  userByName: User;
  userByEmail: User;
  userByOAuthAppId: User;
  userByReferralCode: User;
  users: UserListResult;
  getSettings: SettingsResult;
};


export type QueryUserArgs = {
  filter: Scalars['String'];
};


export type QueryUserByIdArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type QueryUserByNameArgs = {
  name?: Maybe<Scalars['String']>;
};


export type QueryUserByEmailArgs = {
  email?: Maybe<Scalars['String']>;
};


export type QueryUserByOAuthAppIdArgs = {
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthAppId?: Maybe<Scalars['String']>;
};


export type QueryUserByReferralCodeArgs = {
  referralCode?: Maybe<Scalars['Int']>;
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  desc?: Maybe<Scalars['Boolean']>;
};

export type User = {
  __typename?: 'User';
  userId: Scalars['ID'];
  email: Scalars['String'];
  name: Scalars['String'];
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode: Scalars['String'];
  phone?: Maybe<Scalars['String']>;
  defaultCurrency?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  created?: Maybe<Scalars['DateTime']>;
  updated?: Maybe<Scalars['DateTime']>;
  accessFailedCount?: Maybe<Scalars['Int']>;
  nameConfirmed?: Maybe<Scalars['Boolean']>;
  emailConfirmed?: Maybe<Scalars['Boolean']>;
  roles?: Maybe<Array<Scalars['String']>>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedDate?: Maybe<Scalars['DateTime']>;
  is2faEnabled?: Maybe<Scalars['Boolean']>;
  hasEmailAuth?: Maybe<Scalars['Boolean']>;
  state?: Maybe<UserState>;
};


export type UserStateArgs = {
  notificationUnreadOnly?: Maybe<Scalars['Boolean']>;
  notificationSkip?: Maybe<Scalars['Int']>;
  notificationFirst?: Maybe<Scalars['Int']>;
  notificationOrderBy?: Maybe<Scalars['String']>;
  notificationDesc?: Maybe<Scalars['Boolean']>;
};

export enum UserType {
  Merchant = 'Merchant',
  Personal = 'Personal'
}

export enum UserMode {
  InternalWallet = 'InternalWallet',
  ExternalWallet = 'ExternalWallet'
}


export type UserState = {
  __typename?: 'UserState';
  date?: Maybe<Scalars['DateTime']>;
  notifications?: Maybe<Array<UserNotification>>;
};


export type UserStateNotificationsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  desc?: Maybe<Scalars['Boolean']>;
};

export type UserNotification = {
  __typename?: 'UserNotification';
  date?: Maybe<Scalars['DateTime']>;
  text?: Maybe<Scalars['String']>;
};

export enum OAuthProvider {
  Google = 'google',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Microsoft = 'microsoft'
}

export type UserListResult = {
  __typename?: 'UserListResult';
  count?: Maybe<Scalars['Int']>;
  users?: Maybe<Array<User>>;
};

export type SettingsResult = {
  __typename?: 'SettingsResult';
  settings?: Maybe<CommonSettings>;
};

export type CommonSettings = {
  __typename?: 'CommonSettings';
  maxFileSize?: Maybe<Scalars['Int']>;
  maxFiles?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateMe?: Maybe<User>;
  updateUser?: Maybe<User>;
  deleteUser?: Maybe<Scalars['String']>;
  signup: LoginResult;
  login: LoginResult;
  logout: Scalars['Boolean'];
  refreshToken: Scalars['String'];
  confirmEmail: Scalars['Boolean'];
  confirmDevice: Scalars['Boolean'];
  confirmName: LoginResult;
  forgotPassword: Scalars['Boolean'];
  setPassword: Scalars['Boolean'];
  changePassword: Scalars['Boolean'];
  generate2faCode: TwoFactorAuthenticationResult;
  get2faQRCode: Scalars['String'];
  verify2faCode: LoginResult;
  enable2fa: LoginResult;
  disable2fa: LoginResult;
  sendEmailCodePasswordChange: Scalars['Boolean'];
};


export type MutationUpdateMeArgs = {
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateUserArgs = {
  userId: Scalars['ID'];
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Scalars['String']>>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  type: UserType;
  mode: UserMode;
  merchantId?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode: Scalars['String'];
  phone: Scalars['String'];
  password?: Maybe<Scalars['String']>;
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthToken?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
  termsOfUse: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthToken?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
};


export type MutationConfirmEmailArgs = {
  token: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationConfirmDeviceArgs = {
  token: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationConfirmNameArgs = {
  token: Scalars['String'];
  name: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  type: UserType;
  mode: UserMode;
  countryCode: Scalars['String'];
  phone: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationSetPasswordArgs = {
  token: Scalars['String'];
  password: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  code2fa?: Maybe<Scalars['String']>;
  oldPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationGet2faQrCodeArgs = {
  data: Scalars['String'];
};


export type MutationVerify2faCodeArgs = {
  token: Scalars['String'];
  code: Scalars['String'];
};


export type MutationEnable2faArgs = {
  password: Scalars['String'];
  code: Scalars['String'];
};


export type MutationDisable2faArgs = {
  password: Scalars['String'];
  code: Scalars['String'];
};

export type LoginResult = {
  __typename?: 'LoginResult';
  authToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  authTokenAction?: Maybe<Scalars['String']>;
  authTokenActionParam?: Maybe<Scalars['String']>;
};

export type TwoFactorAuthenticationResult = {
  __typename?: 'TwoFactorAuthenticationResult';
  otpauthUrl: Scalars['String'];
  code: Scalars['String'];
  qr: Scalars['String'];
};


export type File = {
  __typename?: 'File';
  fileId?: Maybe<Scalars['ID']>;
  doesFileExist: Scalars['Boolean'];
  fileName: Scalars['String'];
  originFileName: Scalars['String'];
  originFileNameWithoutExtension: Scalars['String'];
  originExtension: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  mimeType?: Maybe<Scalars['String']>;
  encoding?: Maybe<Scalars['String']>;
  fileSize?: Maybe<Scalars['Float']>;
  linkedId?: Maybe<Scalars['String']>;
  linkedObjectSerialNumber?: Maybe<Scalars['Int']>;
  order?: Maybe<Scalars['Int']>;
  created?: Maybe<Scalars['DateTime']>;
  url?: Maybe<Scalars['String']>;
};


export type UploadParams = {
  upload: Scalars['Upload'];
  reason: FileReason;
  fileName?: Maybe<Scalars['String']>;
  mimeType?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['Int']>;
  encoding?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  linkedId?: Maybe<Scalars['String']>;
  linkedObjectSerialNumber?: Maybe<Scalars['Int']>;
  order?: Maybe<Scalars['Int']>;
};

export enum FileReason {
  Support = 'SUPPORT',
  Blog = 'BLOG',
  Statement = 'STATEMENT',
  Kyc = 'KYC',
  Avatar = 'AVATAR'
}

export type UserLogin = {
  __typename?: 'UserLogin';
  date: Scalars['DateTime'];
  result: Scalars['Int'];
  ip?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  area?: Maybe<Scalars['Int']>;
  location?: Maybe<Scalars['String']>;
  browser?: Maybe<Scalars['String']>;
};

export type UserShort = {
  __typename?: 'UserShort';
  email: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode: Scalars['String'];
  valid?: Maybe<Scalars['Boolean']>;
  validationDate?: Maybe<Scalars['DateTime']>;
};

export enum LiquidityProvider {
  Trustology = 'Trustology',
  Fireblocks = 'Fireblocks'
}

export enum PaymentProvider {
  Bitstamp = 'Bitstamp',
  Skrill = 'Skrill',
  Totalprocessing = 'Totalprocessing',
  Sofort = 'Sofort',
  Bank = 'Bank'
}
