import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { SubSink } from 'subsink';
declare const M;

@Component({
  selector: 'app-assign-role-dialog',
  templateUrl: './assign-role-dialog.component.html',
  styleUrls: ['./assign-role-dialog.component.scss'],
})
export class AssignRoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  isLoading: boolean;
  private subs = new SubSink();
  user = {
    roles: ['user', 'admin', 'bendahara', 'divkom']
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilService: UtilityService,
    public dialogRef: MatDialogRef<AssignRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.initEventForm();
    if (this.data) {
      this.patchForm();
    }
  }

  ngAfterViewInit(): void {
  }

  initEventForm() {
    this.roleForm = this.fb.group({
      roles: [[], Validators.required],
    });
  }

  patchForm() {
    this.roleForm.patchValue(this.data);
  }

  printSelections() {
    console.log(this.roleForm.get('roles').value);
  }

  onSubmit() {
    this.formatPayload();
  }

  async formatPayload() {
    this.isLoading = true;
    // try {
    //   const token = (await this.authService.getSession())
    //     .getAccessToken()
    //     .getJwtToken();
    //   const userProfile$ = this.profileService.getProfile(token);
    //   const userProfile: any = await userProfile$.toPromise();
    //   this.roleForm.patchValue({
    //     authorName: `${userProfile[0].firstName} ${userProfile[0].lastName}`,
    //   });
    //   if(this.data) {
    //     const payload = this.eventForm.value;
    //     console.log(payload);
    //     payload.eventId = this.data.eventId;
    //     await this.updateEvent(payload);
    //   } else {
    //     this.eventForm.patchValue({ date: this.utilService.dateToISO(this.eventForm.get('date').value)});
    //     await this.createEvent(this.eventForm.value);
    //   }
    //   this.isLoading = false;
    //   this.dialogRef.close(this.eventForm.value);
    // } catch (error) {
    //   this.isLoading = false;
    //   console.log(error);
    // }
  }

  updateRole(payload) {
    // return this.eventService.editEvent(payload).toPromise();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
