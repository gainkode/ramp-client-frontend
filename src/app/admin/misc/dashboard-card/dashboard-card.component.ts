import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardCardData } from '../../model/dashboard-data.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
	selector: 'app-admin-dashboard-card',
	templateUrl: './dashboard-card.component.html',
	styleUrls: ['./dashboard-card.component.scss'],
	providers: [DashboardService]
})
export class AdminDashboardCardComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() source = '';

  data?: DashboardCardData;

  private subscriptions: Subscription = new Subscription();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
  	this.subscriptions.add(
  		this.dashboardService.data.subscribe(data => {
  			this.data = data[this.source];
  			if(this.source === 'fees'){
  				if(this.data?.rows){
  					for(const row of this.data?.rows){
  						row.volume = `€${parseFloat((<string>row.volume)?.split('€')[1]).toFixed(2)}`;
  					}
  				}
  			}
  			if(this.data?.columns){{
  				for(const col of this.data?.columns){
  					for(const row of this.data?.rows){
  						if(col.type === 'count-volume'){
  							if(row[col.key + 'Volume']){
  								row[col.key + 'Volume'] = typeof row[col.key + 'Volume'] == 'string' ? parseFloat((<string>row[col.key + 'Volume'])).toFixed(2) : (<number>row[col.key + 'Volume']).toFixed(2);
  							}
  						}
  					}
  				}
  			}}

  			if(!this.data?.rows || this.data?.rows.length == 0){
  				this.data = undefined;
  			}
       
  		})
  	);
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }
}
