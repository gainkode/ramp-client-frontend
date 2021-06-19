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
  templateUrl: "payment.component.html",
  styleUrls: ["payment.component.scss"],
})
export class PaymentComponent {
  constructor(private router: Router) {}
}
