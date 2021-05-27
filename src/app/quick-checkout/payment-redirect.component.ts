import { Component, OnInit } from "@angular/core";
import { BrowserModule, DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ErrorService } from "../services/error.service";
import { QuickCheckoutDataService } from "../services/quick-checkout.service";

@Component({
    templateUrl: 'payment-redirect.component.html'
})
export class PaymentRedirectComponent implements OnInit {
    redirectHtml: SafeHtml = '';

    constructor(private dataService: QuickCheckoutDataService, private sanitizer: DomSanitizer,
        private errorHandler: ErrorService, private router: Router) {

    }

    ngOnInit(): void {
        const html =
            //'<!DOCTYPE html>' +
            //'<html lang="en">' +
            //'<head>' +
            //'    <meta http-equiv="content-type" content="text/html; charset=UTF-8" >' +
            //'    <meta http-equiv="refresh" content="10;URL=\'https://channel.paragon.online/payment-form/logs/e8M9iKQA\'" />' +
            //'    <title>Redirecting ...</title>' +
            //'</head>' +
            //'<body>' +
            '    Redirecting...' +
            '    <form name="returnform" action="https://channel.paragon.online/payment-redirect/e8M9iKQA" method="get">' +
            '        <noscript>' +
            '                <input type="submit" name="submit" value="Press this button to continue"/>' +
            '        </noscript>' +
            '    </form>';
            '    <script>' +
            '    function run(){' +
            '            try {' +
            '            var a = window.screen.height,' +
            '            r = window.screen.width,' +
            '            s = window.screen.colorDepth,' +
            '            i = navigator.javaEnabled(),' +
            '            o = navigator.userAgent,' +
            '            c = new Date().getTimezoneOffset(),' +
            '            d = (navigator.browserLanguage !== undefined) ? navigator.browserLanguage : navigator.language;' +
            '            var fingerprintUrl = "".concat("https://channel.paragon.online/", "fingerprint/").concat("e8M9iKQA");' +
            '            var fingerprintClient = new XMLHttpRequest();' +
            '            fingerprintClient.open("POST", fingerprintUrl, true);' +
            '            fingerprintClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");' +
            '            fingerprintClient.onreadystatechange = function() { ' +
            '                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {' +
            '                    console.log("submit form");' +
            '                    document.returnform.submit();' +
            '                }' +
            '            };' +
            '        fingerprintClient.send("time_zone_offset=" + c + "&screen_height=" + a + "&screen_width=" + r + "&color_depth=" + s + "&java_enabled=" + i + "&user_agent=" + o + "&language=" + d);' +
            '    } catch (ex) {' +
            '        console.log("There was an error in code");' +
            '        var xhr = new XMLHttpRequest();' +
            '        xhr.open("POST", "https://channel.paragon.online/" + "payment-form/logs");' +
            '        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");' +
            '        xhr.send("Error=" + ex.message + "&SerialNumber=".concat("e8M9iKQA")); ' +
            '    }' +
            '}' +
            'run();' +
            '    </script>';
            //'</body>' +
            //'</html>';
        this.redirectHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
}



