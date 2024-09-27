import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DashboardCardData, DashboardData } from '../../model/dashboard-data.model';

@Component({
	selector: 'app-admin-dashboard-card',
	templateUrl: './dashboard-card.component.html',
	styleUrls: ['./dashboard-card.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardCardComponent implements OnInit {
  @Input() title = '';
  @Input() source = '';
  @Input() dashboardData: DashboardData;

	data!: DashboardCardData;
  ngOnInit(): void {
		this.data = this.dashboardData[this.source];

		if(this.source === 'fees' && this.data?.rows){
			for(const row of this.data?.rows){
				row.volume = parseFloat((<string>row.volume)?.split('€')[1]).toFixed(2); 
			}
		}

		if(this.data?.columns){{
			for(const col of this.data?.columns){
				for(const row of this.data?.rows){
					if(col.type === 'count-volume' && row[col.key + 'Volume']){
						row[col.key + 'Volume'] = typeof row[col.key + 'Volume'] == 'string' ? parseFloat((<string>row[col.key + 'Volume'])).toFixed(2) : (<number>row[col.key + 'Volume']).toFixed(2);
					}
				}
			}
		}}

		if(!this.data?.rows || this.data?.rows.length === 0){
			this.data = undefined;
		}
  }
}
