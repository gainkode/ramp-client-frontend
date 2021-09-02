import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-label',
  templateUrl: 'tablabel.component.html',
  styleUrls: ['tablabel.component.scss']
})
export class TabLabelComponent {
    @Input() hasErrors: boolean | undefined = false;
    @Input() labelText = '';
}
