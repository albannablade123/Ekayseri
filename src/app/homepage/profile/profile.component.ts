import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import {INDONESIAN_PROVINCES, TURKISH_PROVINCES, EDUCATION_LEVEL, FACULTIES, JALUR, INSTITUTIONS} from 'src/app/shared/statics/static';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userProfile: Observable<any>;
  editForm: FormGroup;
  isEditMode = {
    basic: false,
    about: false,
    education: false,
  }
  currentUserName: any;
  TURKISH_PROVINCES = TURKISH_PROVINCES;
  EDUCATION_LEVEL = EDUCATION_LEVEL;
  FACULTIES = FACULTIES;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchProfile();
  }

  async getUserInfo() {
    this.currentUserName = (await this.authService.getCurrentUserInfo()).username;
  }

  onEdit(profileData: unknown, section: string) {
    this.resetEditMode();
    this.isEditMode[section] = true;
    this.initEditForm();
    console.log(profileData);
    this.editForm.patchValue(profileData[0]);
  }

  resetEditMode() {
    this.isEditMode = {
      basic: false,
      about: false,
      education: false,
    }
  }

  initEditForm() {
    this.editForm = this.fb.group({
      turkishAddress: [null],
      institution: [null],
      about: [null],
      phoneNum: [null],
      turkishProvince: [null],
      faculty: [null],
      educationLevel: [null],
    })
  }

  async fetchProfile() {
    const token = (await this.authService.getSession())
      .getAccessToken()
      .getJwtToken();
    this.userProfile = this.profileService.getProfile(token);
  }

  async onSaveEdit() {
    console.log("to send:", this.editForm.value);
    this.profileService.updateProfile(this.editForm.value).subscribe(resp => {
      if(resp){
        this.resetEditMode();
        this.userProfile = null;
        this.fetchProfile();
      } else {
        alert('oops, something went wrong, try again later');
        this.resetEditMode();
        this.fetchProfile();
      }
    });
  }

  imgUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }
}
