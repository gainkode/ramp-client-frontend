import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    constructor(private httpClient: HttpClient) { }

    kycUpload(formData: FormData) {
        return this.httpClient.post<any>(
            `${environment.api_server}/rest/kyc-upload`,
            formData,
            {
                reportProgress: true,
                observe: 'events'
            });
    }
}
