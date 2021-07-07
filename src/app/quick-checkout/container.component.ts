import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { Input } from "@angular/core";
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  NgForm,
  Validators,
} from "@angular/forms";
import { MatStepper } from "@angular/material/stepper";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CommonGroupValue } from "../model/common.model";
import {
  LoginResult,
  PaymentInstrument,
  PaymentPreauthResultShort,
  PaymentProvider,
  Rate,
  SettingsCommon,
  SettingsCurrencyListResult,
  SettingsKycShort,
  TransactionDestinationType,
  TransactionShort,
  TransactionType,
  User,
  UserMode,
  UserState,
} from "../model/generated-models";
import { KycLevelShort } from "../model/identification.model";
import {
  CardView,
  CheckoutSummary,
  CurrencyView,
  PaymentProviderList,
  QuickCheckoutPaymentInstrumentList,
  QuickCheckoutTransactionTypeList,
} from "../model/payment.model";
import { AuthService } from "../services/auth.service";
import { CommonDataService } from "../services/common-data.service";
import { ErrorService } from "../services/error.service";
import { NotificationService } from "../services/notification.service";
import { QuickCheckoutDataService } from "../services/quick-checkout.service";
import { round } from "../utils/utils";
import { WalletValidator } from "../utils/wallet.validator";

@Component({
  selector: "app-quick-checkout",
  templateUrl: "container.component.html",
  styleUrls: ["container.component.scss"],
})
export class ContainerComponent implements OnInit, OnDestroy {
  @ViewChild("checkoutStepper") private stepper: MatStepper | undefined =
    undefined;
  @ViewChild("details") private ngDetailsForm: NgForm | undefined = undefined;
  @ViewChild("paymentinfo") private ngPaymentInfoForm: NgForm | undefined =
    undefined;
  @ViewChild("verification") private ngVerificationForm: NgForm | undefined =
    undefined;
  @ViewChild("confirmation") private ngConfirmationForm: NgForm | undefined =
    undefined;
  @ViewChild("payment") private ngPaymentForm: NgForm | undefined = undefined;
  @ViewChild("redirect") private ngRedirectForm: NgForm | undefined = undefined;
  @ViewChild("emailinput") emailElement: ElementRef | undefined = undefined;
  @ViewChild("paymentinfonext") paymentInfoNextElement: ElementRef | undefined =
  undefined;
  @ViewChild("verificationreset") verificationResetElement:
    | ElementRef
    | undefined = undefined;
  @ViewChild("codeinput") codeElement: ElementRef | undefined = undefined;
  @ViewChild("redirectnext") redirectNextElement: ElementRef | undefined =
  undefined;
  @ViewChild("checkoutdone") checkoutDoneElement: ElementRef | undefined =
  undefined;
  @ViewChild("iframe") iframe!: ElementRef;
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }
  internalPayment = false;
  affiliateCode = 0;
  user: User | null = null;
  errorMessage = "";
  inProgress = false;
  walletAddressName = "";
  needToLogin = false;
  defaultUserName = "";
  isApmSelected = false;
  flow = "";
  showKycStep = false;
  showKycValidator = false;
  showKycSubmit = false;
  showCodeConfirm = false;
  processDone = false;
  paymentTitle = "";
  paymentCreditCard = false;
  priceEdit = false;
  settingsCommon: SettingsCommon | null = null;
  sourceCurrencies: CurrencyView[] = [];
  destinationCurrencies: CurrencyView[] = [];
  userWallets: CommonGroupValue[] = [];
  userWalletsFiltered: Observable<CommonGroupValue[]> | undefined = undefined;
  transactionList = QuickCheckoutTransactionTypeList;
  paymentInstrumentList = QuickCheckoutPaymentInstrumentList;
  paymentProviderList = PaymentProviderList;
  currentSourceCurrency: CurrencyView | null = null;
  currentDestinationCurrency: CurrencyView | null = null;
  currentRate: Rate | null = null;
  currentTransaction = TransactionType.Deposit;
  currentCard: CardView = new CardView();
  iframedoc: any;
  iframeContent = "";
  transactionApproved = false;
  summary!: CheckoutSummary;

  private pCurrencies: CurrencyView[] = [];
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pSettingsSubscription!: any;
  private pKycSettingsSubscription!: any;
  private pStateSubscription!: any;

  detailsForm = this.formBuilder.group({
    email: [
      "",
      {
        validators: [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
        ],
        updateOn: "change",
      },
    ],
    amountFrom: [
      200,
      {
        validators: [
          Validators.required,
          Validators.pattern(this.pNumberPattern),
        ],
        updateOn: "change",
      },
    ],
    currencyFrom: [
      "",
      { validators: [Validators.required], updateOn: "change" },
    ],
    amountTo: [
      0,
      {
        validators: [
          Validators.required,
          Validators.pattern(this.pNumberPattern),
        ],
        updateOn: "change",
      },
    ],
    currencyTo: ["", { validators: [Validators.required], updateOn: "change" }],
    transaction: [
      TransactionType.Deposit,
      { validators: [Validators.required], updateOn: "change" },
    ],
    complete: ["", { validators: [Validators.required], updateOn: "change" }],
  });
  detailsEmailControl: AbstractControl | null = null;
  detailsAmountFromControl: AbstractControl | null = null;
  detailsCurrencyFromControl: AbstractControl | null = null;
  detailsAmountToControl: AbstractControl | null = null;
  detailsCurrencyToControl: AbstractControl | null = null;
  detailsTransactionControl: AbstractControl | null = null;
  detailsCompleteControl: AbstractControl | null = null;
  paymentInfoForm = this.formBuilder.group(
    {
      instrument: [
        PaymentInstrument.CreditCard,
        { validators: [Validators.required], updateOn: "change" },
      ],
      provider: ["", { validators: [Validators.required], updateOn: "change" }],
      currencyTo: [""],
      address: ["", { validators: [Validators.required], updateOn: "change" }],
      transaction: [TransactionType.Deposit],
      transactionId: [
        "",
        { validators: [Validators.required], updateOn: "change" },
      ],
    },
    {
      validators: [
        WalletValidator.addressValidator(
          "address",
          "currencyTo",
          "transaction"
        ),
      ],
      updateOn: "change",
    }
  );
  paymentInfoInstrumentControl: AbstractControl | null = null;
  paymentInfoProviderControl: AbstractControl | null = null;
  paymentInfoAddressControl: AbstractControl | null = null;
  paymentInfoCurrencyToControl: AbstractControl | null = null;
  paymentInfoTransactionControl: AbstractControl | null = null;
  paymentInfoTransactionIdControl: AbstractControl | null = null;
  verificationForm = this.formBuilder.group({
    complete: ["", { validators: [Validators.required], updateOn: "change" }],
  });
  verificationCompleteControl: AbstractControl | null = null;
  confirmationForm = this.formBuilder.group({
    code: ["", { validators: [Validators.required], updateOn: "change" }],
    complete: ["", { validators: [Validators.required], updateOn: "change" }],
  });
  confirmationCodeControl: AbstractControl | null = null;
  confirmationCompleteControl: AbstractControl | null = null;
  paymentForm = this.formBuilder.group({
    complete: ["", { validators: [Validators.required], updateOn: "change" }],
  });
  paymentCompleteControl: AbstractControl | null = null;
  redirectForm = this.formBuilder.group({
    complete: ["", { validators: [Validators.required], updateOn: "change" }],
  });
  redirectCompleteControl: AbstractControl | null = null;

  get isWalletVisible(): boolean {
    let result = false;
    if (this.currentTransaction === TransactionType.Deposit) {
      result = true;
      if (this.affiliateCode > 0) {
        result = false;
      }
    }
    return result;
  }

  constructor(
    private auth: AuthService,
    private dataService: QuickCheckoutDataService,
    private notification: NotificationService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const affiliateCodeInput = route.snapshot.params['affiliateCode'];
    this.affiliateCode = parseInt(affiliateCodeInput, 10);
    this.user = auth.user;
    this.summary = new CheckoutSummary();
    this.detailsEmailControl = this.detailsForm.get("email");
    this.detailsAmountFromControl = this.detailsForm.get("amountFrom");
    this.detailsCurrencyFromControl = this.detailsForm.get("currencyFrom");
    this.detailsAmountToControl = this.detailsForm.get("amountTo");
    this.detailsCurrencyToControl = this.detailsForm.get("currencyTo");
    this.detailsTransactionControl = this.detailsForm.get("transaction");
    this.detailsCompleteControl = this.detailsForm.get("complete");
    this.paymentInfoInstrumentControl = this.paymentInfoForm.get("instrument");
    this.paymentInfoProviderControl = this.paymentInfoForm.get("provider");
    this.paymentInfoAddressControl = this.paymentInfoForm.get("address");
    this.paymentInfoCurrencyToControl = this.paymentInfoForm.get("currencyTo");
    this.paymentInfoTransactionControl = this.paymentInfoForm.get("transaction");
    this.paymentInfoTransactionIdControl = this.paymentInfoForm.get("transactionId");
    this.verificationCompleteControl = this.verificationForm.get("complete");
    this.confirmationCodeControl = this.confirmationForm.get("code");
    this.confirmationCompleteControl = this.confirmationForm.get("complete");
    this.paymentCompleteControl = this.paymentForm.get("complete");
    this.redirectCompleteControl = this.redirectForm.get("complete");
    this.currentTransaction = TransactionType.Deposit;
  }

  ngOnInit(): void {
    this.notification.subscribeToTransactionNotifications().subscribe(
      ({ data }) => {
        this.handleTransactionSubscription(data);
      },
      (error) => {
        // there was an error subscribing to notifications
        console.log(error);
      }
    );
    this.detailsCurrencyFromControl?.valueChanges.subscribe((val) => {
      this.currentSourceCurrency = this.getCurrency(val);
      if (this.currentSourceCurrency !== null) {
        this.detailsAmountFromControl?.setValidators([
          Validators.required,
          Validators.pattern(this.pNumberPattern),
          Validators.min(this.currentSourceCurrency.minAmount),
        ]);
        this.detailsAmountFromControl?.updateValueAndValidity();
        this.summary.currencyFrom = this.currentSourceCurrency.id;
      }
    });
    this.detailsCurrencyToControl?.valueChanges.subscribe((val) => {
      this.currentDestinationCurrency = this.getCurrency(val);
      if (this.currentDestinationCurrency !== null) {
        this.walletAddressName = `${this.currentDestinationCurrency.name} wallet address`;
        this.detailsAmountToControl?.setValidators([
          Validators.required,
          Validators.pattern(this.pNumberPattern),
          Validators.min(this.currentDestinationCurrency.minAmount),
        ]);
        this.detailsAmountToControl?.updateValueAndValidity();
        this.summary.currencyTo = this.currentDestinationCurrency.id;
      } else {
        this.walletAddressName = "Wallet address";
      }
    });
    this.detailsAmountFromControl?.valueChanges.subscribe((val) => {
      this.setSummuryAmountFrom(val);
    });
    this.detailsAmountToControl?.valueChanges.subscribe((val) => {
      this.setSummuryAmountTo(val);
    });
    this.detailsEmailControl?.valueChanges.subscribe((val) => {
      this.setSummuryEmail(val);
    });
    this.detailsTransactionControl?.valueChanges.subscribe((val) => {
      this.currentTransaction = val as TransactionType;
      this.setCurrencyValues();
      this.priceEdit = true;
      this.updateAmountTo();
      this.priceEdit = false;
    });
    this.isApmSelected = false;
    this.paymentInfoInstrumentControl?.valueChanges.subscribe((val) => {
      this.errorMessage = "";
      this.paymentInfoProviderControl?.setValue("");
      if (val === PaymentInstrument.Apm) {
        this.isApmSelected = true;
      } else {
        this.isApmSelected = false;
        this.paymentInfoProviderControl?.setValue(PaymentProvider.Fibonatix);
      }
    });
    this.paymentInfoAddressControl?.valueChanges.subscribe((val) => {
      this.setSummuryAddress(val);
    });
    this.userWalletsFiltered =
      this.paymentInfoAddressControl?.valueChanges.pipe(
        startWith(""),
        map((value) => this.filterUserWallets(value))
      );
    this.confirmationCodeControl?.valueChanges.subscribe((val) => {
      this.errorMessage = "";
    });
    this.loadDetailsForm();
  }

  ngOnDestroy(): void {
    const s = this.pSettingsSubscription as Subscription;
    const k = this.pKycSettingsSubscription as Subscription;
    const t = this.pStateSubscription as Subscription;
    if (s) {
      s.unsubscribe();
    }
    if (k) {
      k.unsubscribe();
    }
    if (t) {
      t.unsubscribe();
    }
  }

  onUpdateRate(rate: Rate): void {
    this.currentRate = rate;
    this.priceEdit = false;
    this.updateAmountTo();
  }

  onError(error: string): void {
    this.errorMessage = error;
  }

  onProgressChange(status: boolean): void {
    this.inProgress = status;
  }

  onAuthenticated(userData: LoginResult): void {
    if (
      userData.authTokenAction === "Default" ||
      userData.authTokenAction === "KycRequired"
    ) {
      this.handleSuccessLogin(userData);
    } else {
      this.auth.logout();
      this.errorMessage = "Unable to sign in";
    }
  }

  onSocialAuthenticated(userData: LoginResult): void {
    if (
      userData.authTokenAction === "Default" ||
      userData.authTokenAction === "KycRequired"
    ) {
      this.handleSuccessLogin(userData);
    } else if (userData.authTokenAction === "ConfirmName") {
      this.auth.logout();
      this.router.navigateByUrl(`/auth/personal/signup/${userData.authToken}`);
    } else {
      this.auth.logout();
      this.errorMessage = `Invalid authentication via social media`;
    }
  }

  getDestinationAmountMinError(): string {
    return this.getAmountMinError(this.currentDestinationCurrency);
  }

  getSourceAmountMinError(): string {
    return this.getAmountMinError(this.currentSourceCurrency);
  }

  private handleTransactionSubscription(data: any): void {
    let res = this.redirectForm.valid;
    if (!res) {
      const ready = this.redirectCompleteControl?.value;
      console.log("transactionApproved: form is invalid", ready);
    }
    if (res) {
      if (
        data.transactionServiceNotification.type === "PaymentStatusChanged"
      ) {
        res = true;
      } else {
        console.log(
          "transactionApproved: unexpected type",
          data.transactionServiceNotification.type
        );
      }
    }
    if (res) {
      if (
        data.transactionServiceNotification.userId === this.user?.userId
      ) {
        res = true;
      } else {
        console.log(
          "transactionApproved: unexpected userId",
          data.transactionServiceNotification.userId
        );
      }
    }
    if (res) {
      if (
        data.transactionServiceNotification.operationType === "preauth" ||
        data.transactionServiceNotification.operationType === "approved"
      ) {
        res = true;
      } else {
        console.log(
          "transactionApproved: unexpected operationType",
          data.transactionServiceNotification.operationType
        );
      }
    }
    if (res) {
      this.transactionApproved = true;
    }
  }

  private filterUserWalletGroupItem = (opt: string[], value: string): string[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => item.toLowerCase().includes(filterValue));
  };

  private filterUserWallets(value: string): CommonGroupValue[] {
    if (value !== null) {
      return this.userWallets
        .map(group => ({ id: group.id, values: this.filterUserWalletGroupItem(group.values, value) }))
        .filter(group => group.values.length > 0);
    } else {
      return [];
    }
  }

  private handleSuccessLogin(userData: LoginResult): void {
    this.auth.setLoginUser(userData);
    this.detailsEmailControl?.setValue(userData.user?.email);
    this.inProgress = true;
    this.auth.getSettingsCommon().valueChanges.subscribe(
      (settings) => {
        this.inProgress = false;
        if (this.auth.user !== null) {
          const settingsCommon: SettingsCommon =
            settings.data.getSettingsCommon;
          this.auth.setLocalSettingsCommon(settingsCommon);
          this.needToLogin = false;
          if (this.stepper) {
            this.stepper?.next();
          }
        }
      },
      (error) => {
        this.inProgress = false;
        if (this.auth.token !== "") {
          this.errorMessage = this.errorHandler.getError(
            error.message,
            "Unable to load common settings"
          );
        } else {
          this.errorMessage = this.errorHandler.getError(
            error.message,
            "Unable to authenticate user"
          );
        }
      }
    );
  }

  private registerOrder(): void {
    this.inProgress = true;
    let rate = this.currentRate?.originalRate;
    if (this.detailsTransactionControl?.value === TransactionType.Deposit) {
      rate = this.currentRate?.depositRate;
    } else if (
      this.detailsTransactionControl?.value === TransactionType.Withdrawal
    ) {
      rate = this.currentRate?.withdrawRate;
    }
    const amountVal = this.detailsAmountFromControl?.value;
    const amount = parseFloat(amountVal);
    this.dataService.createQuickCheckout(
      this.detailsTransactionControl?.value,
      this.detailsCurrencyFromControl?.value,
      this.detailsCurrencyToControl?.value,
      amount,
      this.paymentInfoInstrumentControl?.value,
      this.paymentInfoProviderControl?.value,
      rate as number,
      TransactionDestinationType.Address,
      this.paymentInfoAddressControl?.value,
      this.affiliateCode
    )
      .subscribe(
        ({ data }) => {
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.orderId = order.code as string;
            this.summary.fee = order.fee;
            this.summary.feeMinEuro = order.feeMinEuro;
            this.summary.feePercent = order.feePercent;
            this.summary.exchangeRate = this.currentRate;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionType = this.currentTransaction;
            this.paymentInfoTransactionIdControl?.setValue(
              order.transactionId as string
            );
            if (this.stepper) {
              this.stepper?.next();
            }
          } else {
            this.errorMessage = "Order code is invalid";
            this.paymentInfoTransactionIdControl?.reset();
          }
        },
        (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === "auth.token_invalid") {
            const email = this.summary.email;
            this.resetStepper();
            this.detailsEmailControl?.setValue(email);
          } else {
            this.paymentInfoTransactionIdControl?.reset();
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to register a new order"
            );
          }
        }
      );
  }

  private getKycSettings(): void {
    this.inProgress = true;
    this.settingsCommon = this.auth.getLocalSettingsCommon();
    const kycData = this.auth.getMyKycSettings();
    if (kycData === null) {
      this.inProgress = false;
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else if (this.settingsCommon === null) {
      this.inProgress = false;
      this.errorMessage = "Unable to load common settings";
    } else {
      this.pKycSettingsSubscription = kycData.valueChanges.subscribe(
        ({ data }) => {
          const settingsKyc: SettingsKycShort | null = data.mySettingsKyc;
          if (settingsKyc === null) {
            this.errorMessage = "Unable to load user identification settings";
          } else {
            const levels = settingsKyc.levels?.map(
              (val) => new KycLevelShort(val)
            ) as KycLevelShort[];
            if (levels.length > 0) {
              const level = levels[0];
              this.flow = level.flowData.value;
            }
            this.inProgress = false;
            this.showKycValidator = true;
          }
        },
        (error) => {
          this.inProgress = false;
          if (this.auth.token !== "") {
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to load settings"
            );
          }
        }
      );
    }
  }

  private loadDetailsForm(): void {
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      const user = this.auth.user;
      if (user) {
        this.detailsEmailControl?.setValue(user.email);
      }
      this.pSettingsSubscription = currencyData.valueChanges.subscribe(
        ({ data }) => {
          const currencySettings =
            data.getSettingsCurrency as SettingsCurrencyListResult;
          let itemCount = 0;
          if (currencySettings !== null) {
            itemCount = currencySettings.count as number;
            if (itemCount > 0) {
              this.loadCurrencies(currencySettings);
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

  private loadCurrencies(settings: SettingsCurrencyListResult): void {
    this.pCurrencies = settings.list?.map(
      (val) => new CurrencyView(val)
    ) as CurrencyView[];
    this.setCurrencyValues();
  }

  private setCurrencyValues(): void {
    if (this.currentTransaction === TransactionType.Deposit) {
      this.sourceCurrencies = this.pCurrencies.filter(
        (c) => c.id !== "BTC" && c.id !== "USDC"
      );
      this.destinationCurrencies = this.pCurrencies.filter(
        (c) => c.id !== "EUR" && c.id !== "USDC"
      );
    } else if (this.currentTransaction === TransactionType.Withdrawal) {
      this.destinationCurrencies = this.pCurrencies.filter(
        (c) => c.id !== "BTC" && c.id !== "USDC"
      );
      this.sourceCurrencies = this.pCurrencies.filter(
        (c) => c.id !== "EUR" && c.id !== "USDC"
      );
    }
    if (this.sourceCurrencies.length > 0) {
      this.detailsCurrencyFromControl?.setValue(this.sourceCurrencies[0].id);
      if (this.currentSourceCurrency) {
        this.detailsAmountFromControl?.setValue(
          this.currentSourceCurrency.minAmount
        );
      }
    }
    if (this.destinationCurrencies.length > 0) {
      this.detailsCurrencyToControl?.setValue(this.destinationCurrencies[0].id);
    }
  }

  private updateAmountTo(): void {
    if (this.currentRate) {
      let rate = 0;
      if (this.currentTransaction === TransactionType.Deposit) {
        rate = this.currentRate.depositRate;
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        rate = this.currentRate.withdrawRate;
      }
      let amount = 0;
      if (rate > 0) {
        const valueFrom = parseFloat(this.detailsAmountFromControl?.value);
        if (this.currentTransaction === TransactionType.Deposit) {
          amount = valueFrom / rate;
        } else if (this.currentTransaction === TransactionType.Withdrawal) {
          amount = valueFrom * rate;
        }
      }
      this.detailsAmountToControl?.setValue(
        round(amount, this.currentDestinationCurrency?.precision)
      );
    }
  }

  private updateAmountFrom(): void {
    if (this.currentRate) {
      let rate = 0;
      if (this.currentTransaction === TransactionType.Deposit) {
        rate = this.currentRate.depositRate;
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        rate = this.currentRate.withdrawRate;
      }
      let amount = 0;
      if (rate > 0) {
        const valueFrom = parseFloat(this.detailsAmountToControl?.value);
        if (this.currentTransaction === TransactionType.Deposit) {
          amount = valueFrom * rate;
        } else if (this.currentTransaction === TransactionType.Withdrawal) {
          amount = valueFrom / rate;
        }
      }
      this.detailsAmountFromControl?.setValue(
        round(amount, this.currentSourceCurrency?.precision)
      );
    }
  }

  private setSummuryAmountFrom(val: any): void {
    if (this.detailsAmountFromControl?.valid) {
      this.summary.amountFrom = val;
      if (!this.priceEdit) {
        this.priceEdit = true;
        this.updateAmountTo();
        this.priceEdit = false;
      }
    }
  }

  private setSummuryAmountTo(val: any): void {
    if (this.detailsAmountToControl?.valid) {
      this.summary.amountTo = val;
      if (!this.priceEdit) {
        this.priceEdit = true;
        this.updateAmountFrom();
        this.priceEdit = false;
      }
    }
  }

  private setSummuryEmail(val: any): void {
    if (this.detailsEmailControl?.valid) {
      this.summary.email = val;
    }
  }

  private setSummuryAddress(val: any): void {
    if (this.paymentInfoAddressControl?.valid) {
      this.summary.address = val;
    }
  }

  private needToRequestKyc(kyc: User): boolean | null {
    let result = true;
    if (kyc.kycStatus === "completed" || kyc.kycStatus === "pending") {
      result = false;
    } else {
      if (kyc.kycValid === true) {
        result = false;
      } else if (kyc.kycValid === false) {
        if (kyc.kycReviewRejectedType === "final") {
          return null;
        }
      }
    }
    return result;
  }

  private needToShowCodeConfirmation(): boolean {
    let isInternalUser = false;
    if (this.auth.user) {
      isInternalUser = this.auth.user.mode === UserMode.InternalWallet;
    }
    return !isInternalUser;
  }

  private loadWallets(): void {
    this.userWallets = [];
    if (this.auth.authenticated && this.summary.transactionType === TransactionType.Deposit) {
      const stateData = this.dataService.getState();
      if (stateData === null) {
        this.errorMessage = this.errorHandler.getRejectedCookieMessage();
      } else {
        this.inProgress = true;
        if (this.pStateSubscription) {
          const s = this.pStateSubscription as Subscription;
          s.unsubscribe();
        }
        this.pStateSubscription = stateData.valueChanges.subscribe(({ data }) => {
          const vaultAssets: string[] = [];
          const externalWallets: string[] = [];

          // temp
          externalWallets.push('1DDBCjmy3zpkNu3rfAFX2ucrRbPiunn1SB');
          // temp


          const state = data.myState as UserState;
          state.assets?.forEach((x) => {
            if (x.id === this.summary.currencyTo) {
              x.addresses?.forEach((a) => vaultAssets.push(a.address as string));
            }
          });
          if (vaultAssets.length > 0) {
            const v = new CommonGroupValue();
            v.id = 'Vault Assets';
            v.values = vaultAssets;
            this.userWallets.push(v);
          }
          state.externalWallets?.forEach((x) => {
            x.assets?.forEach((a) => {
              if (a.id === this.summary.currencyTo) {
                externalWallets.push(a.address as string);
              }
            });
          });
          if (externalWallets.length > 0) {
            const v = new CommonGroupValue();
            v.id = 'External Wallets';
            v.values = externalWallets;
            this.userWallets.push(v);
          }
          this.paymentInfoAddressControl?.setValue('');
          if (this.isWalletVisible) {
            this.paymentInfoAddressControl?.setValidators([Validators.required]);
          } else {
            this.paymentInfoAddressControl?.setValidators([]);
          }
          this.paymentInfoAddressControl?.updateValueAndValidity();
          this.inProgress = false;
          this.getKycStatus();
        }, (error) => {
          this.inProgress = false;
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallet list');
        });
      }
    }
  }

  private getKycStatus(): void {
    const kycStatusData = this.auth.getMyKycData();
    if (kycStatusData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      kycStatusData.valueChanges.subscribe(
        ({ data }) => {
          const userKyc = data.me as User;
          const requestKyc = this.needToRequestKyc(userKyc);
          this.inProgress = false;
          if (requestKyc === null) {
            this.errorMessage =
              "We cannot proceed your payment because your identity is rejected";
          } else {
            this.showKycStep = requestKyc;
          }
          this.showCodeConfirm = this.needToShowCodeConfirmation();
        },
        (error) => {
          this.inProgress = false;
          if (
            this.errorHandler.getCurrentError() === "auth.token_invalid"
          ) {
            this.resetStepper();
          } else {
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to load your identification status"
            );
          }
        }
      );
    }
  }

  stepChanged(step: StepperSelectionEvent): void {
    if (this.errorMessage === "") {
      let focusInput: HTMLInputElement | undefined;
      if (step.selectedStep.label === "details") {
        focusInput = this.emailElement?.nativeElement as HTMLInputElement;
      } else if (step.selectedStep.label === "paymentInfo") {
        this.loadWallets();
        focusInput = this.paymentInfoNextElement?.nativeElement as HTMLInputElement;
        this.paymentInfoCurrencyToControl?.setValue(this.detailsCurrencyToControl?.value);
        this.paymentInfoTransactionControl?.setValue(this.detailsTransactionControl?.value);
        this.paymentInfoProviderControl?.setValue(PaymentProvider.Fibonatix);
      } else if (step.selectedStep.label === "verification") {
        focusInput = this.verificationResetElement
          ?.nativeElement as HTMLInputElement;
        this.getKycSettings();
      } else if (step.selectedStep.label === "confirmation") {
        focusInput = this.codeElement?.nativeElement as HTMLInputElement;
      } else if (step.selectedStep.label === "payment") {
        const instrument = this.paymentInfoInstrumentControl?.value;
        if (instrument === PaymentInstrument.CreditCard) {
          this.paymentTitle = "Payment by credit card";
          this.paymentCreditCard = true;
        } else {
          this.paymentTitle = "Payment is not implemented";
        }
      } else if (step.selectedStep.label === "redirect") {
        focusInput = this.codeElement?.nativeElement as HTMLInputElement;
        if (this.iframedoc) {
          this.redirectCompleteControl?.setValue("ready");
          this.iframedoc.open();
          const content = this.iframeContent;
          this.iframedoc.write(content);
          this.iframedoc.close();
        }
        this.redirectCompleteControl?.setValue("ready");
      } else if (step.selectedStep.label === "complete") {
        // we can't set focus to the button as it causes scroll to this button.
        // So, the step header box stays here after last page appearing as the objective evil
        // If there will be introdused some other element closer to the top of the page to be able to get focus, we can set focus there
        // focusInput = this.checkoutDoneElement?.nativeElement as HTMLInputElement;
        this.processDone = true;
      }
      // Element cannot be focused at once, we need to wait for a moment
      if (focusInput !== undefined) {
        setTimeout(() => {
          focusInput?.focus();
        }, 100);
      }
    }
  }

  resetStepper(): void {
    this.inProgress = false;
    this.errorMessage = "";
    this.walletAddressName = "";
    this.needToLogin = false;
    this.isApmSelected = false;
    this.flow = "";
    this.showKycStep = false;
    this.showKycValidator = false;
    this.showKycSubmit = false;
    this.showCodeConfirm = this.showCodeConfirm = this.needToShowCodeConfirmation();
    this.processDone = false;
    this.paymentCreditCard = false;
    this.summary.reset();
    if (this.stepper) {
      this.stepper.reset();
      this.stepper.steps.forEach((x) => (x.completed = false));
    }
    this.currentCard = new CardView();
    this.ngDetailsForm?.resetForm();
    this.ngPaymentInfoForm?.resetForm();
    this.ngVerificationForm?.resetForm();
    this.ngConfirmationForm?.resetForm();
    this.ngPaymentForm?.resetForm();
    this.ngRedirectForm?.resetForm();
    if (this.auth.authenticated) {
      const user = this.auth.user;
      if (user) {
        this.detailsEmailControl?.setValue(user.email);
      }
    }
    this.detailsTransactionControl?.setValue(TransactionType.Deposit);
    this.paymentInfoInstrumentControl?.setValue(PaymentInstrument.CreditCard);
    this.transactionApproved = false;
    this.iframeContent = "";
    const iframe = document.getElementById("iframe");
    if (iframe) {
      (<HTMLIFrameElement>iframe).srcdoc = "";
    }
  }

  detailsCompleted(): void {
    this.detailsCompleteControl?.setValue("ready");
    if (this.detailsForm.valid) {
      const userEmail = this.detailsEmailControl?.value;
      let authenticated = false;
      const user = this.auth.user;
      if (user) {
        if (user.email === userEmail) {
          authenticated = true;
        }
      }
      if (authenticated) {
        // user is already authorised
        if (this.stepper) {
          this.stepper?.next();
        }
      } else {
        this.inProgress = true;
        // try to authorised a user
        this.auth.authenticate(userEmail, "", true).subscribe(
          ({ data }) => {
            const userData = data.login as LoginResult;
            this.handleSuccessLogin(userData);
          },
          (error) => {
            this.inProgress = false;
            if (
              this.errorHandler.getCurrentError() ===
              "auth.password_null_or_empty"
            ) {
              // Internal user cannot be authorised without a password, so need to
              //  show the authorisation form to fill
              this.auth.logout();
              this.needToLogin = true;
              this.defaultUserName = this.detailsEmailControl?.value;
            } else {
              this.errorMessage = this.errorHandler.getError(
                error.message,
                "Unable to authenticate user"
              );
            }
          }
        );
      }
    }
  }

  paymentInfoCompleted(): void {
    this.paymentInfoTransactionIdControl?.setValue("ready");
    if (this.paymentInfoForm.valid) {
      this.registerOrder();
    }
  }

  confirmPayment(): void {
    this.confirmationCompleteControl?.setValue("ready");
    if (this.confirmationForm.valid) {
      this.inProgress = true;
      const code = this.confirmationCodeControl?.value;
      const transaction = this.paymentInfoTransactionIdControl?.value;
      this.dataService.confirmQuickCheckout(transaction, code).subscribe(
        ({ data }) => {
          this.inProgress = false;
          if (this.stepper) {
            this.stepper?.next();
          }
        },
        (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === "auth.token_invalid") {
            this.resetStepper();
          } else {
            this.confirmationCompleteControl?.reset();
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to confirm your order"
            );
          }
        }
      );
    }
  }

  cardDetails(card: CardView) {
    this.currentCard = card;
  }

  paymentCompleted(): void {
    if (this.paymentCreditCard) {
      this.paymentCompleteControl?.setValue("ready");
    }
    if (this.paymentForm.valid && this.currentCard.valid) {
      this.inProgress = true;
      const transaction = this.paymentInfoTransactionIdControl?.value;
      const instrument = this.paymentInfoInstrumentControl?.value;
      const payment = this.paymentInfoProviderControl?.value;
      this.dataService
        .preAuth(transaction, instrument, payment, this.currentCard)
        .subscribe(
          ({ data }) => {
            const preAuthResult = data.preauth as PaymentPreauthResultShort;
            const order = preAuthResult.order;
            this.summary.setPaymentInfo(
              order?.provider as PaymentProvider,
              instrument as PaymentInstrument,
              order?.paymentInfo as string
            );
            this.iframeContent = preAuthResult.html as string;
            this.inProgress = false;
            if (this.stepper) {
              this.stepper?.next();
            }
          },
          (error) => {
            this.inProgress = false;
            if (this.errorHandler.getCurrentError() === "auth.token_invalid") {
              this.resetStepper();
            } else {
              this.errorMessage = this.errorHandler.getError(
                error.message,
                "Unable to confirm your order"
              );
            }
          }
        );
    }
  }

  /*
    This method is invoked by the KYC widget when a user completes their KYC process
     */
  kycCompleted(): void {
    this.showKycSubmit = true;
    this.showKycValidator = false;
    this.verificationCompleteControl?.setValue("ready");
    if (this.stepper) {
      this.stepper?.next();
    }
  }

  onLoadRedirect(): void {
    var iframe = document.getElementById("iframe");
    var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
    this.iframedoc = iWindow?.document;
  }

  confirmRedirect(): void {
    if (this.stepper) {
      this.stepper?.next();
    }
  }

  done(): void {
    this.router.navigateByUrl(this.auth.getUserMainPage());
  }

  private getCurrency(id: string): CurrencyView | null {
    const c = this.pCurrencies.find((x) => x.id === id);
    return c === undefined ? null : c;
  }

  private getAmountMinError(c: CurrencyView | null): string {
    let error = "Invalid value of amount";
    if (c) {
      error = `Value must be greater than ${c.minAmount}`;
    }
    return error;
  }
}
