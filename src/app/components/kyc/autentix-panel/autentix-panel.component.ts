import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-autentix-panel',
	templateUrl: './autentix-panel.component.html',
	styleUrls: ['./autentix-panel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutentixPanelComponent implements OnInit {
	@Input() url = '';
	urlPolicy = '';

	ngOnInit(): void {
    	this.urlPolicy = `frame-src ${this.url}`;
	}
}
