import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Validators, FormBuilder, AbstractControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Subscription, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CommonTargetValue } from "src/app/model/common.model";
import {
  CountryCodes,
  getCountry,
  getCountryByCode3,
  ICountryCode,
} from "src/app/model/country-code.model";
import {
  SettingsCurrencyListResult,
  User,
} from "src/app/model/generated-models";
import { UserItem } from "src/app/model/user.model";
import { CommonDataService } from "src/app/services/common-data.service";
import { ErrorService } from "src/app/services/error.service";
import { ProfileDataService } from "src/app/services/profile.service";
import { CommonDialogBox } from "../common-box.dialog";

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
  address = "";
  countryName = "";
  currencies: CommonTargetValue[] = [];
  countries: ICountryCode[] = CountryCodes;
  filteredCountries: Observable<ICountryCode[]> | undefined;

  userForm = this.formBuilder.group({
    firstName: ["", { validators: [Validators.required], updateOn: "change" }],
    lastName: ["", { validators: [Validators.required], updateOn: "change" }],
    country: ["", { validators: [Validators.required], updateOn: "change" }],
    phone: ["", { validators: [Validators.required], updateOn: "change" }],
    currency: ["", { validators: [Validators.required], updateOn: "change" }],
  });

  constructor(
    private profile: ProfileDataService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
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
    this.errorMessage = "";
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
              this.currencies = currencySettings.list
                ?.filter((x) => x.fiat)
                .map(
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
    this.userForm.get("firstName")?.setValue(this._user?.firstName);
    this.userForm.get("lastName")?.setValue(this._user?.lastName);
    const selectedCountry = getCountryByCode3(
      this._user?.countryCode3 as string
    );
    if (selectedCountry) {
      this.userForm.get("country")?.setValue(selectedCountry.name);
    }
    const userItem = new UserItem(this._user);
    this.userForm.get("email")?.setValue(this._user?.email);
    this.userForm.get("phone")?.setValue(this._user?.phone);
    this.userForm.get("currency")?.setValue(this._user?.defaultFiatCurrency);
    this.accountId = this._user?.userId;
    this.email = this._user?.email;
    this.address = userItem.address;
    this.countryName = getCountryByCode3(this._user?.countryCode3 as string)?.name as string;
  }

  private showSuccessMessageDialog(): void {
    this.dialog.open(CommonDialogBox, {
      width: "450px",
      data: {
        title: "Profile saving",
        message: "Personal information has been saved successfully.",
      },
    });
  }

  get countryField(): AbstractControl | null {
    return this.userForm.get("country");
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  kycCompleted(): boolean {
    let result = false;
    if (this._user) {
      result = 
        this._user.kycStatus === "completed" && this._user.kycValid === true;
    }
    return result;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.errorMessage = "";
      this.inProgress = true;
      let countryCode = "";
      const country = getCountry(this.userForm.get("country")?.value);
      if (country) {
        countryCode = country.code3;
      }
      this.profile
        .saveUserInfo(
          this.userForm.get("firstName")?.value,
          this.userForm.get("lastName")?.value,
          countryCode,
          this.userForm.get("phone")?.value,
          this.userForm.get("currency")?.value
        )
        .subscribe(
          ({ data }) => {
            this.inProgress = false;
            const userData = data.updateMe as User;
            if (userData.email === this.email) {
              this.showSuccessMessageDialog();
            } else {
              this.errorMessage = "Personal settings was not saved";
            }
          },
          (error) => {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to save personal settings"
            );
          }
        );
    }
  }
}
