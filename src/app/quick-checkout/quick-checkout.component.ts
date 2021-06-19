import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { Router } from "@angular/router";

@Component({
  templateUrl: "quick-checkout.component.html",
  styleUrls: ["quick-checkout.component.scss"],
})
export class QuickCheckoutComponent {
  constructor(private router: Router) {}
}
