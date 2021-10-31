import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { AdminPanelComponent } from './admin-panel.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AdminDebtComponent } from './admin-debt/admin-debt.component';
import { AdminEventComponent } from './admin-event/admin-event.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AdminAnnouncementComponent } from './admin-announcement/admin-announcement.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';
import { AssignRoleDialogComponent } from './admin-roles/assign-role-dialog/assign-role-dialog.component';



@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminDebtComponent,
    AdminEventComponent,
    AdminAnnouncementComponent,
    AdminRolesComponent,
    AssignRoleDialogComponent
  ],
  imports: [
    CommonModule,
    AdminPanelRoutingModule,
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
  ]
})
export class AdminPanelModule { }
