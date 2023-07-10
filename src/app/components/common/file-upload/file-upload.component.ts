import { HttpClient, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

@Component({
	selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	styleUrls: ['./file-upload.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @Input()
  requiredFileType: string;
  @Output() fileSelected = new EventEmitter();

  fileName = 'Choose a file';
  uploadProgress: number;
  uploadSub: Subscription;

  constructor(private http: HttpClient) {}

  onFileSelected(event): void {
  	const files: FileList = event.target.files;

  	if (files) {
  		// this.fileName = file.name;

  		const formData = new FormData();

  		for (var i = 0; i < files.length; i++) {
  			formData.append('files', files[i]);
  		}
		
  		this.fileSelected.emit(formData);


		
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

