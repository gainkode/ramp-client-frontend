import { Component, OnInit } from '@angular/core';

export class DataTable {
  id?: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  startdate?: string;
  salary?: number;
  email?: string;    
}

export const SimpleDataTable: DataTable[] = [
  { id: 1, firstName:'Bella', lastName: 'Chloe',position: 'System Developer', startdate: '2018/03/12', salary: 654765 , email: 'b.Chloe@datatables.net' },
  { id: 2, firstName:'Donna', lastName: 'Bond',position: 'Account Manager', startdate: '2012/02/21', salary: 543654 , email: 'd.bond@datatables.net' },
  { id: 3, firstName:'Harry', lastName: 'Carr',position: 'Technical Manager', startdate: '20011/02/87', salary: 86000 , email: 'h.carr@datatables.net' },
  { id: 4, firstName:'Lucas', lastName: 'Dyer',position: 'Javascript Developer', startdate: '2014/08/23', salary: 456123 , email: 'l.dyer@datatables.net' },
  { id: 5, firstName:'Karen', lastName: 'Hill',position: 'Sales Manager', startdate: '2010/7/14', salary:432230 , email: 'k.hill@datatables.net' }
];

@Component({
  selector: 'app-admin-transactions',
  templateUrl: 'transactions.component.html',
  styleUrls: ['transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  dataTable = SimpleDataTable;
  isFilterCollapsed: boolean = true;

  constructor() { }

  ngOnInit(): void {

  }
}
