export class EnvService {
    public static product = 'GetCoins';
    public static productFull = 'Horns';
    public static cookieDomain = 'localhost';
    public static client_host = 'http://localhost:4000';
    public static api_server = 'http://localhost:4001';
    public static ws_server = 'ws://localhost:4001';
    public static image_host = 'http://localhost';
    public static api_timeout = 60000;
    public static test_wallets = true;
    public static test_kyc = true;
    public static express_transfer = true;
    public static deposit_withdrawal = true;
    public static recaptchaId = '';
    public static googleId = '';
    public static support_email = 'support@test.com';
    public static base_color = '#0081D4';
    public static main_font = 'Ubuntu';
    public static admin_font = 'Space Mono';
    public static crypto_widget_finish_link = '';
    public static cookie_link = '';
    public static terms_link = '';
    public static privacy_link = '';
    public static show_privacy_link = false;

    public static widget_bg_mask = 'true';
    public static widget_bg_name = 'assets/widget-bg.svg';
    public static widget_bg_solid_color = '#79cdd4';
    public static widget_bg_color_1 = '#0d3d55';
    public static widget_bg_color_2 = '#1a68ad';
    public static widget_bg_color_3 = '#00a6ab';
    public static widget_bg_color_4 = '#79cdd4';

    public static widget_secret = '';
    public static widget_api_key = '';

    public static color_white = '#FF0000';

    public static color_pink_900 = '#7c1f45';
    public static color_pink_800 = '#a1264d';
    public static color_pink_700 = '#b62b51';
    public static color_pink_600 = '#cb2f55';
    public static color_pink_500 = '#db3358';
    public static color_pink_400 = '#e1496e';
    public static color_pink_300 = '#e86687';
    public static color_pink_200 = '#ef90a8';
    public static color_pink_100 = '#f5bbcb';
    public static color_pink_50 = '#fbe4ea';

    public static color_green_900 = '#075737';
    public static color_green_800 = '#147351';
    public static color_green_700 = '#1c835f';
    public static color_green_600 = '#22946e';
    public static color_green_500 = '#26a17b';
    public static color_green_400 = '#3bb08c';
    public static color_green_300 = '#5bbf9f';
    public static color_green_200 = '#88d1ba';
    public static color_green_100 = '#b6e3d5';
    public static color_green_50 = '#e1f4ee';

    public static color_orange_900 = '#db5113';
    public static color_orange_800 = '#e66a15';
    public static color_orange_700 = '#ec7916';
    public static color_orange_600 = '#f38818';
    public static color_orange_500 = '#f7931a';
    public static color_orange_400 = '#f9a331';
    public static color_orange_300 = '#fab352';
    public static color_orange_200 = '#fbc983';
    public static color_orange_100 = '#fddeb3';
    public static color_orange_50 = '#fef2e1';

    public static color_purple_900_text = '#686168';
    public static color_purple_900_icons = '#868086';
    public static color_purple_900 = '#362C36';
    public static color_purple_800 = '#463944';
    public static color_purple_700 = '#564451';
    public static color_purple_600 = '#665060';
    public static color_purple_500 = '#72596A';
    public static color_purple_400 = '#85727F';
    public static color_purple_300 = '#998C95';
    public static color_purple_200 = '#B4AEB2';
    public static color_purple_100 = '#D0CFCF';
    public static color_purple_50 = '#ECECEC';

    public static color_main_blue_900 = '#06509e';
    public static color_main_blue_800 = '#0070c0';
    public static color_main_blue_700 = '#0081d4';
    public static color_main_blue_600 = '#0094e9';
    public static color_main_blue_500 = '#00a2f8';
    public static color_main_blue_400 = '#19b0fa';
    public static color_main_blue_300 = '#47befb';
    public static color_main_blue_200 = '#7ed0fd';
    public static color_main_blue_100 = '#b2e3fe';
    public static color_main_blue_50 = '#f6fcff';

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