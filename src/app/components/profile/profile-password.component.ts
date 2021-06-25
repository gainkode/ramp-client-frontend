import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { validate } from "graphql";
import { PasswordValidator } from "src/app/utils/password.validator";

@Component({
  selector: "app-password",
  templateUrl: "./profile-password.component.html",
})
export class ProfilePasswordComponent {
  hidePassword1 = true;
  hidePassword2 = true;
  hidePassword3 = true;
  passwordForm = this.formBuilder.group(
    {
      twofaCode: [
        "",
        {
          validators: [Validators.required],
          updateOn: "change",
        },
      ],
      currentPassword: [
        "",
        { validators: [Validators.required], updateOn: "change" },
      ],
      newPassword: [
        "",
        { validators: [Validators.required], updateOn: "change" },
      ],
      confirmPassword: [
        "",
        { validators: [Validators.required], updateOn: "change" },
      ],
    },
    {
      validators: [
        PasswordValidator.equalityValidator("newPassword", "confirmPassword"),
      ],
      updateOn: "change",
    }
  );

  constructor(private formBuilder: FormBuilder) {}

  getNewPasswordValidation(): string {
    if (this.passwordForm.get("newPassword")?.errors?.required) {
      return "Please specify your password";
    } else if (this.passwordForm.get("newPassword")?.errors?.minlength) {
      return "Password must contain at least 8 symbols";
    }
    return "";
  }

  getConfirmPasswordValidation(): string {
    if (this.passwordForm.get("confirmPassword")?.errors?.required) {
      return "Please confirm your password";
    } else if (this.passwordForm.get("confirmPassword")?.errors?.minlength) {
      return "Password must contain at least 8 symbols";
    } else if (this.passwordForm.get("confirmPassword")?.errors?.pattern) {
      return "Invalid password format";
    }
    return "";
  }

  onSubmit(): void {}
}
