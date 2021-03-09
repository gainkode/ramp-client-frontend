import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  templateUrl: './kyc.component.html',
  styleUrls: ['./profile.scss']
})
export class KycPersonalComponent implements OnInit {
  @ViewChild("fileUpload", { static: false })
  fileUpload!: ElementRef;
  user: User | null = null;
  uploadForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private auth: AuthService, private upload: UploadService) {
    this.user = auth.user;
  }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      kyc: ['']
    });
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
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('kyc')?.value);
    this.upload.kycUpload(formData).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );
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
