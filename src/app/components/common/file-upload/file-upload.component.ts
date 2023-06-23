import { HttpClient, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

@Component({
	selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	styleUrls: ['./file-upload.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @Input()
  requiredFileType: string;

  fileName = 'Choose a file';
  uploadProgress: number;
  uploadSub: Subscription;

  constructor(private http: HttpClient) {}

  onFileSelected(event): void {
  	const file: File = event.target.files[0];

  	if (file) {
  		this.fileName = file.name;
  		const formData = new FormData();
  		formData.append('thumbnail', file);

  		// const upload$ = this.http
  		// 	.post('/api/thumbnail-upload', formData, {
  		// 		reportProgress: true,
  		// 		observe: 'events',
  		// 	})
  		// 	.pipe(finalize(() => this.reset()));

  		// this.uploadSub = upload$.subscribe((event) => {
  		// 	if (event.type === HttpEventType.UploadProgress) {
  		// 		this.uploadProgress = Math.round(100 * (event.loaded / event.total));
  		// 	}
  		// });
  	}
  }
}

