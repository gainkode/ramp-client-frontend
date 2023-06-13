import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LayoutService {
	constructor() { }
  
	//Sidebar Notification
	private emitSidebarNofitSource = new Subject<any>();
	SidebarNotifyChangeEmitted = this.emitSidebarNofitSource.asObservable();
	emitSidebarNotifyChange(change: any): void{
		this.emitSidebarNofitSource.next(change);
	}
	//Sidebar
	private emitSwitcherSource = new Subject<any>();
	SwitcherChangeEmitted = this.emitSwitcherSource.asObservable();
	emitSwitcherChange(change: any): void{
		this.emitSwitcherSource.next(change);
	}
}
