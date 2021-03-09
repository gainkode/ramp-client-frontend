import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./profile.scss']
})
export class ProfileMainPersonalComponent implements OnInit {
  user: User | null = null;

  constructor(private router: Router, private auth: AuthService) {
    this.user = auth.user;
  }

  ngOnInit(): void {
    
  }
}
