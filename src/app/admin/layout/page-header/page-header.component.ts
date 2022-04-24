import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class AdminPageHeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() items!: any[];
  @Input() active_item!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
