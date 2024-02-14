import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SettingsFeeSimilarObject } from 'model/generated-models';

@Component({
	standalone: true,
	selector: 'app-fee-similiar-panel',
	templateUrl: './fee-similiar-panel.component.html',
	styleUrls: ['./fee-similiar-panel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatExpansionModule, NgFor, NgIf],
})
export class FeeSimiliarPanelComponent {
  @Input() targetField: SettingsFeeSimilarObject;
}
