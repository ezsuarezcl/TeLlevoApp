import { Component } from '@angular/core';
import { IonContent, IonHeader, IonFooter } from "@ionic/angular/standalone";
import { ToolbarComponent } from "../components/toolbar/toolbar.component";
import { FooterComponent } from "../components/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [ IonFooter, IonHeader, IonContent, ToolbarComponent, FooterComponent, RouterOutlet]
})
export default class LayoutComponent {

  constructor() { }

}
