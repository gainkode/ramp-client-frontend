import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GenericEvent } from 'types';

@Component({
	selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	styleUrls: ['./file-upload.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @Input() requiredFileType: string;
  @Input() multiple = false;
  @Output() fileSelected = new EventEmitter();

  fileName = 'Choose a file';
  
  constructor() {}

  onFileSelected(event: GenericEvent<HTMLInputElement>): void {
  	const files: FileList = event.target.files;

  	if (files) {
  		const formData = new FormData();
  		const filesName = [];

  		for (let i = 0; i < files.length; i++) {
  			formData.append('files', files[i]);
  			filesName.push(files.item(i).name);
  		}
		
  		this.fileName = filesName.join(',');
  		this.fileSelected.emit(formData);
  	}
  }
}

