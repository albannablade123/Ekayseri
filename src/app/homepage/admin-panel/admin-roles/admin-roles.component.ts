import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventService } from 'src/app/shared/services/event.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { SubSink } from 'subsink';
import { AddEventDialogComponent } from '../../dashboard/add-event-dialog/add-event-dialog.component';
import { AssignRoleDialogComponent } from './assign-role-dialog/assign-role-dialog.component';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss'],
})
export class AdminRolesComponent implements OnInit {
  @ViewChild('eventPaginator', { static: true }) eventPaginator: MatPaginator;
  eventDataCount;
  eventList = new MatTableDataSource([]);
  eventSearchInput = new FormControl(null);
  subs = new SubSink();
  isLoading = true;
  displayedEventTableColumns = ['name', 'roles', 'actions'];
  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private utilService: UtilityService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.subs.sink = this.eventService.getEvents().subscribe((resp: any) => {
      this.eventList.data = resp.events;
      this.eventList.paginator = this.eventPaginator;
      this.isLoading = false;
    });
  }

  onAddEvent() {
    let dialogRef = this.dialog
      .open(AddEventDialogComponent, {
        panelClass: 'basic-dialog-container',
      })
      .afterClosed()
      .subscribe((dialogResult) => {
        this.fetchUsers();
      });
  }

  onEditRoles(element) {
    this.subs.sink = this.dialog
      .open(AssignRoleDialogComponent, {
        panelClass: 'basic-dialog-container',
        data: element,
      })
      .afterClosed()
      .subscribe((dialogResult) => {
        this.fetchUsers();
      });
  }

  async onDeleteEvent(element) {
    console.log('element is:', element);
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await this.eventService
          .deleteEvent(element.eventId, element.date)
          .toPromise();
        this.fetchUsers();
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      return;
    }
  }
}
