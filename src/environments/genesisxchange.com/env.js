(function (window) {
    window.__env_data = window.__env_data || {};

    // Product name for titles and headers
    window.__env_data.product = 'Genesis';
    window.__env_data.productFull = 'Genesis Exchange';
    // Coockie domain
    window.__env_data.cookieDomain = 'app.genesisxchange.com';

    window.__env_data.client_host = 'https://app.genesisxchange.com',
    window.__env_data.api_server = 'https://app.genesisxchange.com',
    window.__env_data.ws_server = 'wss://app.genesisxchange.com',
    window.__env_data.image_host = 'https://app.genesisxchange.com',

    // API time out
    window.__env_data.api_timeout = 60000;
    // Using test wallets
    window.__env_data.test_wallets = false;
    // Using test KYC environment
    window.__env_data.test_kyc = false;
    // Show Express Transfer button on the top menu bar
    window.__env_data.express_transfer = true;
    // Show Deposit % Withdrawal button on the top menu bar
    window.__env_data.deposit_withdrawal = false;
    // Show Set current button for create transaction
    window.__env_data.create_transaction_update_rate = true;
    // Recaptcha ID
    window.__env_data.recaptchaId = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    window.__env_data.recaptchaSiteKey = '0x4AAAAAAAE-qpHEMwxyozoe';
    window.__env_data.recaptchaProvider = 'Turnstile';
    // Google ID
    window.__env_data.googleId = '683937471887-u8r2tuvcvibnsnc41grnvcer9tv5bpm6.apps.googleusercontent.com';
    // Support team email address
    window.__env_data.support_email = 'support@genesisxchange.com';
    // Base color number
    window.__env_data.base_color = '#35D0BA';
    // Main font name
    window.__env_data.main_font = 'Space Mono';
    window.__env_data.admin_font = 'Poppins';
    // Crypto widget finish link
    window.__env_data.crypto_widget_finish_link = '';
    // Cookie agreement link
    window.__env_data.cookie_link = 'https://genesisxchange.com/cookies-policy/';
    // Terms and conditions link
    window.__env_data.terms_link = 'https://genesisxchange.com/terms-and-conditiones/';
    // Privacy policy link
    window.__env_data.privacy_link = 'http://genesisxchange.com/privacy-policy/';
    // Show privacy policy link
    window.__env_data.show_privacy_link = true;

    window.__env_data.widget_bg_mask = 'false';
    window.__env_data.widget_bg_name = '';

    //////////////////////////////////////////////////
    //                                              //
    //                     COLORS                   //
    //                                              //
    //////////////////////////////////////////////////
    // Widget colors
    window.__env_data.widget_bg_solid_color = '#FFFFFF';
    // White color
    window.__env_data.color_white = '#FFFFFF';
    // Pink colors (error handling)
    window.__env_data.color_pink_900 = '#7c1f45';
    window.__env_data.color_pink_800 = '#a1264d';
    window.__env_data.color_pink_700 = '#b62b51';
    window.__env_data.color_pink_600 = '#cb2f55';
    window.__env_data.color_pink_500 = '#db3358';
    window.__env_data.color_pink_400 = '#e1496e';
    window.__env_data.color_pink_300 = '#e86687';
    window.__env_data.color_pink_200 = '#ef90a8';
    window.__env_data.color_pink_100 = '#f5bbcb';
    window.__env_data.color_pink_50 = '#fbe4ea';
    // Green colors
    window.__env_data.color_green_900 = '#075737';
    window.__env_data.color_green_800 = '#147351';
    window.__env_data.color_green_700 = '#1c835f';
    window.__env_data.color_green_600 = '#22946e';
    window.__env_data.color_green_500 = '#26a17b';
    window.__env_data.color_green_400 = '#3bb08c';
    window.__env_data.color_green_300 = '#5bbf9f';
    window.__env_data.color_green_200 = '#88d1ba';
    window.__env_data.color_green_100 = '#b6e3d5';
    window.__env_data.color_green_50 = '#e1f4ee';
    // Orange colors
    window.__env_data.color_orange_900 = '#db5113';
    window.__env_data.color_orange_800 = '#e66a15';
    window.__env_data.color_orange_700 = '#ec7916';
    window.__env_data.color_orange_600 = '#f38818';
    window.__env_data.color_orange_500 = '#f7931a';
    window.__env_data.color_orange_400 = '#f9a331';
    window.__env_data.color_orange_300 = '#fab352';
    window.__env_data.color_orange_200 = '#fbc983';
    window.__env_data.color_orange_100 = '#fddeb3';
    window.__env_data.color_orange_50 = '#fef2e1';
    // Purple colors (top menu and title backgrounds, text, icons)
    window.__env_data.color_purple_900_text = '#A4A9AC';
    window.__env_data.color_purple_900_icons = '#adb1b4';
    window.__env_data.color_purple_900 = '#020710';  // top menu bar
    window.__env_data.color_purple_800 = '#1b1f27';
    window.__env_data.color_purple_700 = '#34383f';
    window.__env_data.color_purple_600 = '#4d5157';
    window.__env_data.color_purple_500 = '#676a6f';
    window.__env_data.color_purple_400 = '#808387';
    window.__env_data.color_purple_300 = '#999b9f';
    window.__env_data.color_purple_200 = '#b3b4b7';
    window.__env_data.color_purple_100 = '#cccdcf';
    window.__env_data.color_purple_50 = '#e5e6e7';
    // Blue colors (buttons, titles, icons)
    window.__env_data.color_main_blue_900 = '#2aa694';
    window.__env_data.color_main_blue_800 = '#2fbba7';
    window.__env_data.color_main_blue_700 = '#35D0BA'; // main color
    window.__env_data.color_main_blue_600 = '#49d4c0';
    window.__env_data.color_main_blue_500 = '#5dd9c7';
    window.__env_data.color_main_blue_400 = '#71dece';
    window.__env_data.color_main_blue_300 = '#85e2d5';
    window.__env_data.color_main_blue_200 = '#9ae7dc';
    window.__env_data.color_main_blue_100 = '#aeece3';
    window.__env_data.color_main_blue_50 = '#c2f0ea';

}(this));