import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
//import { snsWebSdk } from '@sumsub/websdk';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs/operators';
import { KycDocumentType, KycInfo, User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

const snsWebSdk = require('@sumsub/websdk');

@Component({
  templateUrl: './kyc.component.html',
  styleUrls: ['./profile.scss']
})
export class KycPersonalComponent implements OnInit, OnDestroy {
  @ViewChild("fileUpload", { static: false })
  fileUpload!: ElementRef;
  user: User | null = null;
  uploadForm!: FormGroup;
  identityForm!: FormGroup;
  selfieForm!: FormGroup;
  inProgress = false;
  errorMessage = '';
  currentStep = '';
  kycInfo!: KycInfo;
  identityDocs: KycDocumentType | undefined;
  identitySubDocs: KycDocumentType | undefined;
  selfieDocs: KycDocumentType | undefined;
  private _kycSubscription!: any;
  kycToken: string = '';

  constructor(@Inject(DOCUMENT) private _document: Document,
    private renderer2: Renderer2,
    private formBuilder: FormBuilder, private router: Router,
    private auth: AuthService, private errorHandler: ErrorService) {
    this.user = auth.user;
    this.uploadForm = this.formBuilder.group({
      kyc: ['']
    });
    this.identityForm = this.formBuilder.group({
      docType: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    this.selfieForm = this.formBuilder.group({
      selphie: ['']
    });
  }

  ngOnInit(): void {
    //this.installSumSubService();
    this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
      this.launchSumSubWidget(
        'https://test-api.sumsub.com', 'ewallet-kyc-flow', data.generateWebApiToken, '', '', []);
    });


    //this.inProgress = true;
    // this.identityForm.get('docType')?.valueChanges.subscribe(val => {
    //   this.identitySubDocs = this.identityDocs?.subTypes?.find(doc => doc.type === val);
    //   this.identitySubDocs?.subTypes?.forEach(s => {
    //     const c = this.identityForm.get(s.type as string);
    //     if (c !== null) {
    //       c.setValue(null);
    //     } else {
    //       this.identityForm.addControl(s.type as string, new FormControl());
    //     }
    //   });
    // });
    // this.currentStep = 'IDENTITY';
    // this._kycSubscription = this.auth.getMyKycInfo().valueChanges.subscribe(({ data }) => {
    //   this.inProgress = false;
    //   this.kycInfo = data.myKycInfo;
    //   this.identityDocs = this.kycInfo.requiredInfo?.documents?.find(x => x.type === 'IDENTITY');
    //   this.selfieDocs = this.kycInfo.requiredInfo?.documents?.find(x => x.type === 'SELFIE');
    // }, (error) => {
    //   this.inProgress = false;
    //   if (this.auth.token !== '') {
    //     this.errorMessage = this.errorHandler.getError(
    //       error.message,
    //       'Unable to load approval process data');
    //   } else {
    //     this.router.navigateByUrl('/');
    //   }
    // });
  }

  // @param apiUrl - 'https://test-api.sumsub.com' (sandbox) or 'https://api.sumsub.com' (production)
  // @param flowName - the flow name chosen at Step 1 (e.g. 'basic-kyc')
  // @param accessToken - access token that you generated on the backend in Step 2
  // @param applicantEmail - applicant email (not required)
  // @param applicantPhone - applicant phone, if available (not required)
  // @param customI18nMessages - customized locale messages for current session (not required)
  launchSumSubWidget(apiUrl: string, flowName: string, accessToken: string, applicantEmail: string,
    applicantPhone: string, customI18nMessages: string[]) {

    const snsWebSdkInstance = snsWebSdk.default.Builder(apiUrl, flowName)
      .withAccessToken(accessToken,
        (newAccessTokenCallback: (newToken: string) => void) => {
          // Access token expired
          // get a new one and pass it to the callback to re-initiate the WebSDK
          console.log('update token');
          this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
            newAccessTokenCallback(data.generateWebApiToken);
          });
        }
      )
      .withConf({
        lang: 'en',
        email: applicantEmail,
        phone: applicantPhone,
        i18n: customI18nMessages,
        onMessage: (type: any, payload: any) => {
          // see below what kind of messages the WebSDK generates
          console.log('WebSDK onMessage', type, payload);
        },
        // uiConf: {
        //   customCss: "https://url.com/styles.css"
        //   // URL to css file in case you need change it dynamically from the code
        //   // the similar setting at Applicant flow will rewrite customCss
        //   // you may also use to pass string with plain styles `customCssStr:`
        // },
        onError: (error: any) => {
          console.error('WebSDK onError', error);
        },
      })
      .build();
    // you are ready to go:
    // just launch the WebSDK by providing the container element for it
    snsWebSdkInstance.launch('#sumsub-websdk-container');
  }

  ngOnDestroy() {
    (this._kycSubscription as Subscription).unsubscribe();
  }

  private installSumSubService() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = `https://static.sumsub.com/idensic/static/sns-websdk-builder.js`;
    this.renderer2.appendChild(this._document.body, s);
  }

  onFileSelect(event: any) {
    console.log(event);
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.identityForm.get(event.target.name)?.setValue(file);
      console.log(event.target.name);
      console.log(this.identityForm.get(event.target.name)?.value);
    }
  }

  browseFile() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.click();
  }

  onIdentitySubmit() {
    console.log(this.identityForm.get('docType')?.value);
    console.log(this.identityForm.get('FRONT_SIDE')?.value);
    console.log(this.identityForm.get('BACK_SIDE')?.value);
    console.log(this.selfieDocs);
    this.currentStep = 'SELFIE';
    // const formData = new FormData();
    // formData.append('file', this.uploadForm.get('kyc')?.value);
    // this.upload.kycUpload(formData).subscribe(
    //   (res) => console.log(res),
    //   (err) => console.log(err)
    // );
  }

  onSelfieSubmit() {

  }

  // uploadFile() {
  //   const formData = new FormData();
  //   formData.append('file', file.data);
  //   file.inProgress = true;
  //   this.upload.kycUpload(formData).pipe(
  //     map(event => {
  //       switch (event.type) {
  //         case HttpEventType.UploadProgress:
  //           const total = event.total as number;
  //           if (total != 0) {
  //             file.progress = Math.round(event.loaded * 100 / total);
  //           } else {
  //             file.progress = 0;
  //           }
  //           break;
  //         case HttpEventType.Response:
  //           return event;
  //       }
  //     }),
  //     catchError((error: HttpErrorResponse) => {
  //       file.inProgress = false;
  //       return of(`${file.data.name} upload failed.`);
  //     })).subscribe((event: any) => {
  //       if (typeof (event) === 'object') {
  //         console.log(event.body);
  //       }
  //     });
  // }

  // private uploadFiles() {
  //   this.fileUpload.nativeElement.value = '';
  //   this.files.forEach(file => {
  //     this.uploadFile(file);
  //   });
  // }

  // onClick() {
  //   const fileUpload = this.fileUpload.nativeElement; fileUpload.onchange = () => {
  //     for (let index = 0; index < fileUpload.files.length; index++) {
  //       const file = fileUpload.files[index]; 
  //       this.files.push({ data: file, inProgress: false, progress: 0 });
  //     }
  //     this.uploadFiles();
  //   };
  //   fileUpload.click();
  // }
}
