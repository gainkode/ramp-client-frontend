import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EmptyValueModule } from 'pipes/empty-value/empty-value.module';

@NgModule({
	declarations: [TableComponent],
	imports: [
		CommonModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		EmptyValueModule
	],
	exports: [TableComponent, MatTableModule, MatSortModule],
})
export class TableModule {}
