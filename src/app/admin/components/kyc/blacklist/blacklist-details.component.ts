import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { Countries, Country, getCountryByCode3 } from 'model/country-code.model';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-black-list-details',
	templateUrl: 'blacklist-details.component.html',
	styleUrls: ['blacklist-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminCountryBlackListDetailsComponent implements OnDestroy {
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  errorMessage = '';
  countryOptions = Countries;

  form = this.formBuilder.group({
  	country: [null, { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private adminService: AdminDataService) {

  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  getCountryFlag(code: string): string {
  	return `${code.toLowerCase()}.svg`;
  }

  onSubmit(): void {
  	this.submitted = true;
  	if (this.form.valid) {
  		const c = this.form.controls.country.value as Country;
  		this.addCountry(c.code3);
  	}
  }

  private addCountry(code3: string): void {
  	this.errorMessage = '';
  	const c = getCountryByCode3(code3);
  	if (c) {
  		this.saveInProgress = true;
  		const requestData$ = this.adminService.addBlackCountry(c.code2);
  		this.subscriptions.add(
  			requestData$.subscribe(({ data }) => {
  				this.saveInProgress = false;
  				this.save.emit();
  			}, (error) => {
  				this.saveInProgress = false;
  				this.errorMessage = error;
  				if (this.auth.token === '') {
  					void this.router.navigateByUrl('/');
  				}
  			})
  		);
  	}
  }
}
