import { Component } from '@angular/core';
import { IonToolbar, IonButton } from "@ionic/angular/standalone";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonButton, IonToolbar, RouterModule]
})
export class FooterComponent {

  constructor() { }

}
