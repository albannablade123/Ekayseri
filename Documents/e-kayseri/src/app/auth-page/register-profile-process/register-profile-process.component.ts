import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
declare const M: any;

@Component({
  selector: 'app-register-profile-process',
  templateUrl: './register-profile-process.component.html',
  styleUrls: ['./register-profile-process.component.scss'],
})
export class RegisterProfileProcessComponent implements OnInit {
  // @ViewChild('datePicker', {static: true}) elems: ElementRef;

  stepListener$ = new BehaviorSubject<number>(1);
  basicInfoForm: FormGroup;
  educationForm: FormGroup;
  aboutMeForm: FormGroup;
  currentStep: number = 1;
  formState: { isCompleted: boolean; savedForm: Object }[] = [
    {
      isCompleted: false,
      savedForm: null,
    },
    {
      isCompleted: false,
      savedForm: null,
    },
    {
      isCompleted: false,
      savedForm: null,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private authService: AuthService,
    private utilService: UtilityService
  ) {}

  ngOnInit(): void {
    this.stepListener$.subscribe((step: number) => {
      this.currentStep = step;
      this.initFormBasedOnStep(step);
    });
  }

  initFormBasedOnStep(step: number) {
    switch (step) {
      case 1:
        this.initBasicInfoForm();
        break;
      case 2:
        this.initEducationForm();
        break;
      case 3:
        this.initAboutMeForm();
        break;
    }
  }

  initBasicInfoForm() {
    this.basicInfoForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      dateOfBirth: [null, Validators.required],
      sex: [null, Validators.required],
      phoneNum: [null, Validators.required],
      address: [null, Validators.required],
      email: [''],
    });
  }

  initEducationForm() {
    this.educationForm = this.fb.group({
      dateOfArrival: [null, Validators.required],
      educationLevel: [null, Validators.required],
      institution: [null, Validators.required],
      faculty: [' '],
      turkishProvince: [null, Validators.required],
    });
  }

  initAboutMeForm() {
    this.aboutMeForm = this.fb.group({
      about: [' '],
      indonesianProvince: [null, Validators.required],
    });
  }

  isFormInvalid(): boolean {
    return this.getFormOfCurrentStep().invalid;
  }

  formatDates() {
    this.basicInfoForm.patchValue({
      dateOfBirth: this.utilService.dateToUnix(this.basicInfoForm.get('dateOfBirth').value),
    });
    this.educationForm.patchValue({
      dateOfArrival: this.utilService.dateToUnix(
        this.educationForm.get('dateOfArrival').value
      ),
    });
  }

  getFormOfCurrentStep(): FormGroup {
    switch (this.currentStep) {
      case 1:
        return this.basicInfoForm;
        break;
      case 2:
        return this.educationForm;
      case 3:
        return this.aboutMeForm;
    }
  }

  onNextStep() {
    if (this.currentStep !== 3) {
      this.formState[this.currentStep].isCompleted = true;
      this.formState[this.currentStep].savedForm =
        this.getFormOfCurrentStep().value;
      this.stepListener$.next((this.currentStep += 1));
    }
  }

  onPreviousStep() {
    if (this.currentStep !== 1) {
      this.stepListener$.next((this.currentStep -= 1));
      this.getFormOfCurrentStep().patchValue(
        this.formState[this.currentStep].savedForm
      );
      M.updateTextFields();
    }
  }

  async onRegister() {
    if (typeof this.basicInfoForm.get('dateOfBirth').value !== 'string') {
      this.formatDates();
    }
    const payload = {
      ...this.basicInfoForm.value,
      ...this.educationForm.value,
      ...this.aboutMeForm.value,
    };
    payload.email = (await this.authService.getCurrentUser()).attributes.email;
    this.profileService.createProfile(payload).subscribe((resp) => {
      if (resp) {
        console.log(resp);
        this.router.navigate(['/']);
      }
    });
  }
}
