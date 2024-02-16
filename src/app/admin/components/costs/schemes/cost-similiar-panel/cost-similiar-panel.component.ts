import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SettingsCostSimilarObject } from 'model/generated-models';

@Component({
	standalone: true,
	selector: 'app-cost-similiar-panel',
	templateUrl: './cost-similiar-panel.component.html',
	styleUrls: ['./cost-similiar-panel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatExpansionModule, NgFor, NgIf],
})
export class CostSimiliarPanelComponent {
  @Input() targetField: SettingsCostSimilarObject;
}
