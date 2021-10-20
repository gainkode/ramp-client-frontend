import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-widget-processing-frame',
  templateUrl: 'processing-frame.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetProcessingFrameComponent implements AfterViewInit {
  @Input() iframeContent = '';
  @Input() completed = false;
  @Output() onComplete = new EventEmitter();
  @ViewChild('iframe') iframe!: ElementRef;

  iframedoc: any;

  ngAfterViewInit(): void {
    if (this.iframedoc) {
      this.iframedoc.open();
      const content = this.iframeContent;
      this.iframedoc.write(content);
      this.iframedoc.close();
    }
  }

  onLoadFrame(): void {
    const iframe = document.getElementById('iframe');
    const iWindow = (iframe as HTMLIFrameElement).contentWindow;
    this.iframedoc = iWindow?.document;
  }
}
