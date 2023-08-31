import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableComponent } from './table.component';

xdescribe('TableComponent', () => {
	let component: TableComponent<any>;
	let fixture: ComponentFixture<TableComponent<any>>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [TableComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
