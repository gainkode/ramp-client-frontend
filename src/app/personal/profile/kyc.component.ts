import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs/operators';
import { KycDocumentType, KycInfo, User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { UploadService } from 'src/app/services/upload.service';

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
  inProgress = false;
  errorMessage = '';
  kycInfo!: KycInfo;
  identityDocs: KycDocumentType | undefined;
  identitySubDocs: KycDocumentType | undefined;
  selfieDocs: KycDocumentType | undefined;
  private _kycSubscription!: any;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private auth: AuthService, private errorHandler: ErrorService, private upload: UploadService) {
    this.user = auth.user;
    this.uploadForm = this.formBuilder.group({
      kyc: ['']
    });
    this.identityForm = this.formBuilder.group({
      docType: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
  }

  ngOnInit(): void {
    this.inProgress = true;
    this.identityForm.get('docType')?.valueChanges.subscribe(val => {
      this.identitySubDocs = this.identityDocs?.subTypes?.find(doc => doc.type === val);
      this.identitySubDocs?.subTypes?.forEach(s => {
        const c = this.identityForm.get(s.type as string);
        if (c !== null) {
          c.setValue(null);
        } else {
          this.identityForm.addControl(s.type as string, new FormControl());
        }
      });
    });
    this._kycSubscription = this.auth.getMyKycInfo().valueChanges.subscribe(({ data }) => {
      this.inProgress = false;
      this.kycInfo = data.myKycInfo;
      this.identityDocs = this.kycInfo.requiredInfo?.documents?.find(x => x.type === 'IDENTITY');
      this.selfieDocs = this.kycInfo.requiredInfo?.documents?.find(x => x.type === 'SELFIE');
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(
          error.message,
          'Unable to load approval process data');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy() {
    (this._kycSubscription as Subscription).unsubscribe();
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('kyc')?.setValue(file);
    }
  }

  browseFile() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.click();
  }

  onSubmit() {
    console.log(this.identityForm.get('docType')?.value);
    // const formData = new FormData();
    // formData.append('file', this.uploadForm.get('kyc')?.value);
    // this.upload.kycUpload(formData).subscribe(
    //   (res) => console.log(res),
    //   (err) => console.log(err)
    // );
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
