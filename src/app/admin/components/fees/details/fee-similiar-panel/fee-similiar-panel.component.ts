import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  standalone: true,
  selector: 'app-fee-similiar-panel',
  templateUrl: './fee-similiar-panel.component.html',
  styleUrls: ['./fee-similiar-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, NgFor, NgIf],
})
export class FeeSimiliarPanelComponent implements OnInit {
  targetField: any;


  ngOnInit(): void {
      console.log(this.targetField)
  }
}
