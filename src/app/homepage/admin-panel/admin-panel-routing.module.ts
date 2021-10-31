import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAnnouncementComponent } from './admin-announcement/admin-announcement.component';
import { AdminDebtComponent } from './admin-debt/admin-debt.component';
import { AdminEventComponent } from './admin-event/admin-event.component';
import { AdminPanelComponent } from './admin-panel.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';

const routes: Routes = [
  { 
    path: '',
    component: AdminPanelComponent,
    children: [
      {
        path: 'uang-kas',
        component: AdminDebtComponent,
      },
      {
        path: 'events',
        component: AdminEventComponent,
      },
      {
        path: 'announcements',
        component: AdminAnnouncementComponent,
      },
      {
        path: 'roles',
        component: AdminRolesComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
