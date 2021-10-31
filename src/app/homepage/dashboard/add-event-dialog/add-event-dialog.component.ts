import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventObject, EventService } from 'src/app/shared/services/event.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss'],
})
export class AddEventDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  eventForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  isLoading: boolean;
  private subs = new SubSink();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilService: UtilityService,
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.initEventForm();
    if(this.data) {
      this.patchForm();
    }
  }

  ngAfterViewInit(): void {
    this.subs.sink = this.eventForm.get('fromTime').valueChanges.subscribe(resp => {
      if(this.eventForm.get('fromTime').value) {
        this.eventForm.get('toTime').enable();
        this.eventForm.updateValueAndValidity();
      }
    })
  }

  initEventForm() {
    this.eventForm = this.fb.group({
      eventTitle: ['', Validators.required],
      eventDuration: ["1", Validators.required],
      eventDescription: ['', Validators.required],
      authorName: [''],
      eventLocation: ['', Validators.required],
      date: ['', Validators.required],
      fromTime: [null, Validators.required],
      toTime: [{value: null, disabled: true}, [Validators.required, this.timeValidator]],
      tags: [['PPI']],
    });
  }

  timeValidator (control: AbstractControl):{[key: string]: boolean} | null {
    if( control.value !== null && control.parent && (<FormGroup>control.parent).get('fromTime').value && control.value < (<FormGroup>control.parent).get('fromTime').value) {
      return {'timeValidator': true}
    }
    return null;
  };



  patchForm() {
    this.eventForm.patchValue(this.data);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      console.log(typeof this.eventForm.get('tags').value);
      this.eventForm.get('tags').value.push(value);
    }
    // Clear the input value
    event.input.value = '';
  }

  removeTag(tag: string): void {
    const index = this.eventForm.get('tags').value.indexOf(tag);

    if (index >= 0) {
      this.eventForm.get('tags').value.splice(index, 1);
    }
  }

  onSubmit() {
    this.formatPayload();
  }

  async formatPayload() {
    this.isLoading = true;
    try {
      const token = (await this.authService.getSession())
        .getAccessToken()
        .getJwtToken();
      const userProfile$ = this.profileService.getProfile(token);
      const userProfile: any = await userProfile$.toPromise();
      this.eventForm.patchValue({
        authorName: `${userProfile[0].firstName} ${userProfile[0].lastName}`,
      });
      if(this.data) {
        const payload = this.eventForm.value;
        console.log(payload);
        payload.eventId = this.data.eventId;
        await this.updateEvent(payload);
      } else {
        this.eventForm.patchValue({ date: this.utilService.dateToISO(this.eventForm.get('date').value)});
        await this.createEvent(this.eventForm.value);
      }
      this.isLoading = false;
      this.dialogRef.close(this.eventForm.value);
    } catch (error) {
      this.isLoading = false;
      console.log(error);
    }
  }

  updateEvent(payload: EventObject) {
    return this.eventService.editEvent(payload).toPromise();
  }

  createEvent(payload: EventObject) {
    return this.eventService.createEvent(payload).toPromise();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
