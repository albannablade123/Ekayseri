import {
  AfterViewInit,
  ChangeDetectorRef,
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
import {INDONESIAN_PROVINCES, TURKISH_PROVINCES, EDUCATION_LEVEL, FACULTIES, JALUR, INSTITUTIONS} from 'src/app/shared/statics/static';
declare const M: any;

@Component({
  selector: 'app-register-profile-process',
  templateUrl: './register-profile-process.component.html',
  styleUrls: ['./register-profile-process.component.scss'],
})
export class RegisterProfileProcessComponent implements OnInit {
  // @ViewChild('datePicker', {static: true}) elems: ElementRef;
  private autoInstitution: ElementRef;

  @ViewChild('autoInstitution', {static: false, read: ElementRef}) set content(content: ElementRef) {
     if(content) { // initially setter gets called with undefined
         this.autoInstitution = content;
     }
  }


  stepListener$ = new BehaviorSubject<number>(1);
  basicInfoForm: FormGroup;
  educationForm: FormGroup;
  aboutMeForm: FormGroup;
  emergencyContactForm: FormGroup;
  currentStep: number = 1;
  otherInput = false;
  EDUCATION_LEVEL = EDUCATION_LEVEL;
  INDONESIAN_PROVINCES = INDONESIAN_PROVINCES;
  TURKISH_PROVINCES = TURKISH_PROVINCES;
  FACULTIES = FACULTIES;
  JALUR = JALUR;
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
    {
      isCompleted: false,
      savedForm: null,
    }
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private authService: AuthService,
    private utilService: UtilityService,
    private changeDetectorRef: ChangeDetectorRef,
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
      case 4:
        this.initEmergencyContactForm();
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
      turkishAddress: [null, Validators.required],
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
      jalur: ['mandiri'],
    });
    this.initInstitutionAutoComplete();
  }

  initInstitutionAutoComplete() {
    let institutionList = {};
    for (const insName of INSTITUTIONS) {
      institutionList[insName] = null;
    }
    this.changeDetectorRef.detectChanges();
    const institutionRef = this.autoInstitution.nativeElement;
    const instance = M.Autocomplete.init(institutionRef, {data: institutionList, onAutocomplete: (option) => {
      this.educationForm.get('institution').patchValue(option);
    }});
  }

  initAboutMeForm() {
    this.aboutMeForm = this.fb.group({
      about: [' '],
      indonesianProvince: [null, Validators.required],
    });
  }

  initEmergencyContactForm() {
    this.emergencyContactForm = this.fb.group({
      indonesianAddress: [null],
      guardianPhoneNumber: [null],
      guardianName: [null],
    });
  }

  isFormInvalid(): boolean {
    return this.getFormOfCurrentStep().invalid;
  }

  formatDates() {
    this.basicInfoForm.patchValue({
      dateOfBirth: this.utilService.dateToISO(
        this.basicInfoForm.get('dateOfBirth').value
      ),
    });
    this.educationForm.patchValue({
      dateOfArrival: this.utilService.dateToISO(
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
      case 4:
        return this.emergencyContactForm;
    }
  }

  onNextStep() {
    if (this.currentStep <= this.formState.length) {
      this.formState[this.currentStep - 1].isCompleted = true; //make existing step to completed = true in formState
      this.formState[this.currentStep - 1].savedForm =
        this.getFormOfCurrentStep().value;  //save the existing form data to the formState object 
      this.stepListener$.next((this.currentStep += 1));
      //if previously there is already saved data, patch it again in case of return to this step by clicking next
      if (this.formState[this.currentStep - 1].savedForm) { 
        this.patchCurrentFormWithSavedData();
      }
    }
  }

  onPreviousStep() {
    if (this.currentStep !== 1) {
      //if form valid then save data so user can go back and then return and have the form data saved
      if(!this.isFormInvalid()) {
        this.formState[this.currentStep - 1].isCompleted = false;
        this.formState[this.currentStep - 1].savedForm = this.getFormOfCurrentStep().value;
        this.patchCurrentFormWithSavedData();
      }
      this.stepListener$.next((this.currentStep -= 1));
      this.patchCurrentFormWithSavedData(); //patch previous step form so user can see their previous step changes
      M.updateTextFields();
    }
  }

  patchCurrentFormWithSavedData() {
    this.getFormOfCurrentStep().patchValue(
      this.formState[this.currentStep - 1].savedForm
    );
  }

  async onRegister() {
    if (typeof this.basicInfoForm.get('dateOfBirth').value !== 'string') {
      this.formatDates();
    }
    const payload = {
      ...this.basicInfoForm.value,
      ...this.educationForm.value,
      ...this.aboutMeForm.value,
      ...this.emergencyContactForm.value,
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
