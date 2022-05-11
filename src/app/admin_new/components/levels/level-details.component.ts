import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { Countries, Country, getCountryByCode3 } from 'src/app/model/country-code.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-level-details',
  templateUrl: 'level-details.component.html',
  styleUrls: ['level-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminLevelDetailsComponent implements OnDestroy {
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
    private formBuilder: FormBuilder,
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
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }
}
