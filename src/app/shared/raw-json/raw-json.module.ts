import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RawJsonComponent } from './raw-json.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
	declarations: [RawJsonComponent],
	imports: [CommonModule, NgxJsonViewerModule],
	exports: [RawJsonComponent],
})
export class RawJsonModule {}
