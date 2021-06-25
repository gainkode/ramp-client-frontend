import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { User } from "src/app/model/generated-models";
import { AuthService } from "src/app/services/auth.service";
import { ErrorService } from "src/app/services/error.service";
import { ProfileDataService } from "src/app/services/profile.service";
import { PasswordValidator } from "src/app/utils/password.validator";
import { CommonDialogBox } from "../common-box.dialog";

@Component({
  selector: "app-password",
  templateUrl: "./profile-password.component.html",
})
export class ProfilePasswordComponent implements OnInit {
  inProgress = false;
  errorMessage = "";
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
        {
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
          ], updateOn: "change"
        },
      ],
      confirmPassword: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
          ], updateOn: "change"
        },
      ],
    },
    {
      validators: [
        PasswordValidator.equalityValidator("newPassword", "confirmPassword"),
      ],
      updateOn: "change",
    }
  );

  constructor(
    private auth: AuthService,
    private profile: ProfileDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    
  }

  getNewPasswordValidation(): string {
    if (this.passwordForm.get('newPassword')?.errors?.required) {
      return "Please specify your password";
    } else if (this.passwordForm.get("newPassword")?.errors?.minlength) {
      return "Password must contain at least 8 symbols";
    }
    return "";
  }

  getConfirmPasswordValidation(): string {
    if (this.passwordForm.get("confirmPassword")?.errors?.required) {
      return 'Please confirm your password';
    } else if (this.passwordForm.get("confirmPassword")?.errors?.minlength) {
      return 'Password must contain at least 8 symbols';
    } else if (this.passwordForm.get("confirmPassword")?.errors?.pattern) {
      return 'Invalid password format';
    }
    return '';
  }

  private showSuccessMessageDialog(): void {
    this.dialog.open(CommonDialogBox, {
      width: "450px",
      data: {
        title: "Password change",
        message: "Password has been changed successfully.",
      },
    });
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.errorMessage = "";
      this.inProgress = true;
      this.profile.changePassword(
        this.passwordForm.get("twofaCode")?.value,
        this.passwordForm.get("currentPassword")?.value,
        this.passwordForm.get("newPassword")?.value
      )
        .subscribe(
          ({ data }) => {
            this.inProgress = false;
            const resultData = data.changePassword as boolean;
            if (resultData) {
              this.showSuccessMessageDialog();
            } else {
              this.errorMessage = "Password is not changed";
            }
          },
          (error) => {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getError(
              error.message,
              "Unable to change a password"
            );
          }
        );
    }
  }
}
