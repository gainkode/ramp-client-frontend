import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Validators, FormBuilder, AbstractControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CommonTargetValue } from "src/app/model/common.model";
import { CountryCodes, getCountryByCode3, ICountryCode } from "src/app/model/country-code.model";
import {
  SettingsCurrencyListResult,
  User,
} from "src/app/model/generated-models";
import { AuthService } from "src/app/services/auth.service";
import { CommonDataService } from "src/app/services/common-data.service";
import { ErrorService } from "src/app/services/error.service";
import { ProfileDataService } from "src/app/services/profile.service";

@Component({
  selector: "app-info",
  templateUrl: "./profile-info.component.html",
})
export class ProfileInfoComponent implements OnInit, OnDestroy {
  @Input()
  set user(data: User | null) {
    this._user = data as User;
    this.loadForm();
  }
  private _user!: User;
  private pSettingsSubscription!: any;
  inProgress = false;
  errorMessage = "";
  accountId = "";
  email = "";
  currencies: CommonTargetValue[] = [];
  countries: ICountryCode[] = CountryCodes;
  filteredCountries: Observable<ICountryCode[]> | undefined;

  userForm = this.formBuilder.group({
    id: [""],
    userName: ["", { validators: [Validators.required], updateOn: "change" }],
    address: ["", { validators: [Validators.required], updateOn: "change" }],
    country: ["", { validators: [Validators.required], updateOn: "change" }],
    email: [""],
    phone: ["", { validators: [Validators.required], updateOn: "change" }],
    currency: ["", { validators: [Validators.required], updateOn: "change" }],
  });

  constructor(
    private auth: AuthService,
    private profile: ProfileDataService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filteredCountries = this.countryField?.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterCountries(value))
    );
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    const s = this.pSettingsSubscription as Subscription;
    if (s) {
      s.unsubscribe();
    }
  }

  private filterCountries(value: string | ICountryCode): ICountryCode[] {
    let filterValue = "";
    if (value) {
      filterValue =
        typeof value === "string"
          ? value.toLowerCase()
          : value.name.toLowerCase();
      return this.countries.filter((c) =>
        c.name.toLowerCase().includes(filterValue)
      );
    } else {
      return this.countries;
    }
  }

  private loadCurrencies(): void {
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this.pSettingsSubscription = currencyData.valueChanges.subscribe(
        ({ data }) => {
          const currencySettings =
            data.getSettingsCurrency as SettingsCurrencyListResult;
          let itemCount = 0;
          if (currencySettings !== null) {
            itemCount = currencySettings.count as number;
            if (itemCount > 0) {
              this.currencies = currencySettings.list?.map(
                (val) =>
                  <CommonTargetValue>{
                    id: val.symbol,
                    title: val.name,
                  }
              ) as CommonTargetValue[];
              this.loadForm();
            }
          }
          this.inProgress = false;
        },
        (error) => {
          this.inProgress = false;
          this.errorMessage = this.errorHandler.getError(
            error.message,
            "Unable to load settings"
          );
        }
      );
    }
  }

  private loadForm(): void {
    this.userForm.get("id")?.setValue(this._user?.userId);
    this.userForm.get("userName")?.setValue(this._user?.name);
    this.userForm.get("address")?.setValue("");
    const selectedCountry = getCountryByCode3(this._user?.countryCode3 as string);
    if (selectedCountry) {
        this.userForm.get("country")?.setValue(selectedCountry.name);
    }
    this.userForm.get("email")?.setValue(this._user?.email);
    this.userForm.get("phone")?.setValue(this._user?.phone);
    this.userForm.get("currency")?.setValue(this._user?.defaultCurrency);
    this.accountId = this._user?.userId;
    this.email = this._user?.email;
  }

  get countryField(): AbstractControl | null {
    return this.userForm.get("country");
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }
}
