(function (window) {
    window.__env_data = window.__env_data || {};

    // Product name for titles and headers
    window.__env_data.product = 'GetCoins';
    // Coockie domain
    window.__env_data.cookieDomain = 'localhost';

    // Current client host address
    window.__env_data.client_host = 'http://localhost:4000';
    // API server address
    window.__env_data.api_server = 'http://localhost:4001';
    // API WebSocket address
    window.__env_data.ws_server = 'ws://localhost:4001';
    // Image hosting address
    window.__env_data.image_host = 'http://localhost';

    // window.__env_data.client_host = 'https://app.crunchywallet.io',
    // window.__env_data.api_server = 'https://app.crunchywallet.io',
    // window.__env_data.ws_server = 'wss://app.crunchywallet.io',
    // window.__env_data.image_host = 'https://app.crunchywallet.io',

    // window.__env_data.client_host = 'https://app.getcoins.com.au',
    // window.__env_data.api_server = 'https://app.getcoins.com.au',
    // window.__env_data.ws_server = 'wss://app.getcoins.com.au',
    // window.__env_data.image_host = 'https://app.getcoins.com.au',

    // window.__env_data.client_host: 'https://app.getcoins.eu',
    // window.__env_data.api_server: 'https://app.getcoins.eu',
    // window.__env_data.ws_server: 'wss://app.getcoins.eu',
    // window.__env_data.image_host: 'https://app.getcoins.eu',

    // API time out
    window.__env_data.api_timeout = 60000;
    // Using test wallets
    window.__env_data.test_wallets = true;
    // Using test KYC environment
    window.__env_data.test_kyc = false;
    // Show Express Transfer button on the top menu bar
    window.__env_data.express_transfer = true;
    // Recaptcha ID
    window.__env_data.recaptchaId = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    // Google ID
    window.__env_data.googleId = '683937471887-u8r2tuvcvibnsnc41grnvcer9tv5bpm6.apps.googleusercontent.com';
    // Support team email address
    window.__env_data.support_email = 'support@ewallet.com';
    // Base color number
    window.__env_data.base_color = '#0081D4';
    // Main font name
    window.__env_data.main_font = 'Ubuntu';
    // Cookie agreement link
    window.__env_data.cookie_link = 'http://getcoins.com.au/index.php/cookies-policy/';
    // Terms and conditions link
    window.__env_data.terms_link = 'http://getcoins.com.au/index.php/terms-and-conditions/';

    //////////////////////////////////////////////////
    //                                              //
    //                     COLORS                   //
    //                                              //
    //////////////////////////////////////////////////
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
    window.__env_data.color_purple_900_text = '#686168';
    window.__env_data.color_purple_900_icons = '#868086';
    window.__env_data.color_purple_900 = '#362C36';  // top menu bar
    window.__env_data.color_purple_800 = '#463944';
    window.__env_data.color_purple_700 = '#564451';
    window.__env_data.color_purple_600 = '#665060';
    window.__env_data.color_purple_500 = '#72596A';
    window.__env_data.color_purple_400 = '#85727F';
    window.__env_data.color_purple_300 = '#998C95';
    window.__env_data.color_purple_200 = '#B4AEB2';
    window.__env_data.color_purple_100 = '#D0CFCF';
    window.__env_data.color_purple_50 = '#ECECEC';
    // Blue colors (buttons, titles, icons)
    window.__env_data.color_main_blue_900 = '#06509e';
    window.__env_data.color_main_blue_800 = '#0070c0';
    window.__env_data.color_main_blue_700 = '#0081d4'; // main color
    window.__env_data.color_main_blue_600 = '#0094e9';
    window.__env_data.color_main_blue_500 = '#00a2f8';
    window.__env_data.color_main_blue_400 = '#19b0fa';
    window.__env_data.color_main_blue_300 = '#47befb';
    window.__env_data.color_main_blue_200 = '#7ed0fd';
    window.__env_data.color_main_blue_100 = '#b2e3fe';
    window.__env_data.color_main_blue_50 = '#f6fcff';


}(this));