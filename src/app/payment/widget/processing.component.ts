import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';

@Component({
  selector: 'app-widget-processing',
  templateUrl: 'processing.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetProcessingComponent implements AfterViewInit, OnInit {
  @Input() iframeContent = '';
  @Input() iframeUrl = '';
  @Input() completed = false;
  @Output() onComplete = new EventEmitter();
  @ViewChild('iframe') iframe!: ElementRef;

  iframedoc: any;
  url!: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    console.log('this.iframeUrl', this.iframeUrl);
    if (this.iframeUrl !== '') {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
      console.log(this.url);
    }
  }

  ngAfterViewInit(): void {
    if (this.iframedoc) {
      this.iframedoc.open();
      const content = this.iframeContent;
      this.iframedoc.write(content);
      this.iframedoc.close();
    }
  }

  onLoadFrame(): void {
    if (this.iframeUrl === '') {
      const iframe = document.getElementById('iframe');
      const iWindow = (iframe as HTMLIFrameElement).contentWindow;
      this.iframedoc = iWindow?.document;
    }
  }
}
