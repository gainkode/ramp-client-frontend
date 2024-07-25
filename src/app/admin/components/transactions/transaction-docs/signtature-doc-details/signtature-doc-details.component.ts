import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SignatureDocument } from '../../models/transaction-docs.model';

@Component({
  selector: 'app-signtature-doc-details',
  templateUrl: './signtature-doc-details.component.html',
  styleUrls: ['./signtature-doc-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigntatureDocDetailsComponent implements OnInit {
	@Input() signatureDocument: SignatureDocument;
	// copyText = copyText;
	
	ngOnInit(): void {

	}
}
