import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, AfterViewInit {
  isLoading = true;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.isLoading = false;
  }
}
