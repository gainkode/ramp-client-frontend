import {
  Component,
  ComponentRef,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";

@Component({
  templateUrl: "payment-complete.component.html",
})
export class PaymentCompleteComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    //console.log("iframe");
    //const iframe = this.hostElement.nativeElement.querySelector("iframe");
    //iframe.src =
    //  '<!DOCTYPE html><html lang="en"><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8" > <meta http-equiv="refresh" content="10;URL=\'https://channel.paragon.online/payment-form/logs/3TLn6gnf\'" /> <title>Redirecting ...</title></head><body> Redirecting... <form name="returnform" action="https://channel.paragon.online/payment-redirect/3TLn6gnf" method="get"> <noscript> <input type="submit" name="submit" value="Press this button to continue"/> </noscript> </form> <script> function run(){ try { var a = window.screen.height, r = window.screen.width, s = window.screen.colorDepth, i = navigator.javaEnabled(), o = navigator.userAgent, c = new Date().getTimezoneOffset(), d = (navigator.browserLanguage !== undefined) ? navigator.browserLanguage : navigator.language; var fingerprintUrl = "".concat("https://channel.paragon.online/", "fingerprint/").concat("3TLn6gnf"); var fingerprintClient = new XMLHttpRequest(); fingerprintClient.open("POST", fingerprintUrl, true); fingerprintClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); fingerprintClient.onreadystatechange = function() { if (this.readyState === XMLHttpRequest.DONE && this.status === 200) { console.log("submit form"); document.returnform.submit(); } }; fingerprintClient.send("time_zone_offset=" + c + "&screen_height=" + a + "&screen_width=" + r + "&color_depth=" + s + "&java_enabled=" + i + "&user_agent=" + o + "&language=" + d); } catch (ex) { console.log("There was an error in code"); var xhr = new XMLHttpRequest(); xhr.open("POST", "https://channel.paragon.online/" + "payment-form/logs"); xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); xhr.send("Error=" + ex.message + "&SerialNumber=".concat("3TLn6gnf")); }}run(); </script></body></html>';
  }

  onLoad() {
    var iframe = document.getElementById("iframe");
    console.log(iframe);
    var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
    console.log(iWindow);
    const doc = iWindow?.document;
    if (doc) {
      doc.open();
      doc.write(
        '<!DOCTYPE html><html lang="en"><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8" > <meta http-equiv="refresh" content="10;URL=\'https://channel.paragon.online/payment-form/logs/3TLn6gnf\'" /> <title>Redirecting ...</title></head><body> Redirecting... <form name="returnform" action="https://channel.paragon.online/payment-redirect/3TLn6gnf" method="get"> <noscript> <input type="submit" name="submit" value="Press this button to continue"/> </noscript> </form> <script> function run(){ try { var a = window.screen.height, r = window.screen.width, s = window.screen.colorDepth, i = navigator.javaEnabled(), o = navigator.userAgent, c = new Date().getTimezoneOffset(), d = (navigator.browserLanguage !== undefined) ? navigator.browserLanguage : navigator.language; var fingerprintUrl = "".concat("https://channel.paragon.online/", "fingerprint/").concat("3TLn6gnf"); var fingerprintClient = new XMLHttpRequest(); fingerprintClient.open("POST", fingerprintUrl, true); fingerprintClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); fingerprintClient.onreadystatechange = function() { if (this.readyState === XMLHttpRequest.DONE && this.status === 200) { console.log("submit form"); document.returnform.submit(); } }; fingerprintClient.send("time_zone_offset=" + c + "&screen_height=" + a + "&screen_width=" + r + "&color_depth=" + s + "&java_enabled=" + i + "&user_agent=" + o + "&language=" + d); } catch (ex) { console.log("There was an error in code"); var xhr = new XMLHttpRequest(); xhr.open("POST", "https://channel.paragon.online/" + "payment-form/logs"); xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); xhr.send("Error=" + ex.message + "&SerialNumber=".concat("3TLn6gnf")); }}run(); </script></body></html>'
      );
      doc.close();
    }
    // var doc = iframe.contentDocument || iframe.contentWindow.document;
    // console.log(iframe);
  }
}
