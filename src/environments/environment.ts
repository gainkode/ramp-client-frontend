// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cookieDomain: 'localhost',
  client_host: 'http://localhost:4000',
  api_server: 'http://localhost:4001',
  ws_server: 'ws://localhost:4001',
  image_host: 'http://localhost',
  // api_server: 'https://merx-ewallet.semirolab.com',
  // ws_server: 'https://merx-ewallet.semirolab.com/gql',
  api_timeout: 60000,
  test_wallets: true,
  test_kyc: true,
  recaptchaId: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  googleClientId: '683937471887-u8r2tuvcvibnsnc41grnvcer9tv5bpm6.apps.googleusercontent.com',
  facebookClientId: '522193095423714',
  support_email: 'support@ewallet.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
