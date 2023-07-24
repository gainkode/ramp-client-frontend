import { Component, Input, OnInit } from '@angular/core';
@Component({
	selector: 'app-shufti-panel',
	styleUrls: ['./shufti-panel.component.scss'],
	templateUrl: 'shufti-panel.component.html'
})
export class ShuftiPanelComponent implements OnInit {
    @Input() url = '';
    urlPolicy = '';

    ngOnInit(): void {
    	this.urlPolicy = `frame-src ${this.url}`;
    }
}
