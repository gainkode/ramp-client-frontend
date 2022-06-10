export class EnvService {
    public product = 'GetCoins';
    public cookieDomain = 'localhost';
    public client_host = 'http://localhost:4000';
    public api_server = 'http://localhost:4001';
    public ws_server = 'ws://localhost:4001';
    public image_host = 'http://localhost';
    public api_timeout = 60000;
    public test_wallets = true;
    public test_kyc = true;
    public express_transfer = true;
    public recaptchaId = '';
    public support_email = 'support@test.com';
    public base_color = '#0081D4';
    public main_font = 'Ubuntu';
    public cookie_link = '';
    public terms_link = '';

    constructor() {
    }
}

export const EnvServiceFactory = () => {
    // Create env
    const env = new EnvService();

    // Read environment variables from browser window
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env_data'] || {};

    // Assign environment variables from browser window to env
    // In the current implementation, properties from env.js overwrite defaults from the EnvService.
    // If needed, a deep merge can be performed here to merge properties instead of overwriting them.
    for (const key in browserWindowEnv) {
        if (browserWindowEnv.hasOwnProperty(key)) {
            env[key] = window['__env_data'][key];
        }
    }

    return env;
};

export const EnvServiceProvider = {
    provide: EnvService,
    useFactory: EnvServiceFactory,
    deps: [],
};