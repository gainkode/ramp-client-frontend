export class EnvService {
    public static product = 'GetCoins';
    public static cookieDomain = 'localhost';
    public static client_host = 'http://localhost:4000';
    public static api_server = 'http://localhost:4001';
    public static ws_server = 'ws://localhost:4001';
    public static image_host = 'http://localhost';
    public static api_timeout = 60000;
    public static test_wallets = true;
    public static test_kyc = true;
    public static express_transfer = true;
    public static recaptchaId = '';
    public static support_email = 'support@test.com';
    public static base_color = '#0081D4';
    public static main_font = 'Ubuntu';
    public static cookie_link = '';
    public static terms_link = '';

    constructor() {
    }
}

export const EnvServiceFactory = () => {
    // Read environment variables from browser window
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env_data'] || {};

    // Assign environment variables from browser window to env
    // In the current implementation, properties from env.js overwrite defaults from the EnvService.
    // If needed, a deep merge can be performed here to merge properties instead of overwriting them.
    for (const key in browserWindowEnv) {
        if (browserWindowEnv.hasOwnProperty(key)) {
            EnvService[key] = window['__env_data'][key];
        }
    }

    //return new EnvService();
};

export const EnvServiceProvider = {
    provide: EnvService,
    useFactory: EnvServiceFactory,
    deps: [],
};