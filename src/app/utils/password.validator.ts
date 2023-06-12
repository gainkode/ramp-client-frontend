import { UntypedFormGroup, ValidationErrors } from '@angular/forms';

export class PasswordValidator {
	static equalityValidator(password1Field: string, password2Field: string): ValidationErrors | null {
		return (fg: UntypedFormGroup) => {
			const password1Control = fg.controls[password1Field];
			const password2Control = fg.controls[password2Field];

			if (!password1Control || !password2Control) {
				return null;
			}
			if (!password1Control.value || !password2Control.value) {
				return null;
			}
			if (password1Control.value === password2Control.value) {
				return null;
			} else {
				return { passwordEqual: true };
			}
		};
	}
}
