import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { DeviceItem, UserItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-admin-user-devices',
  templateUrl: 'devices.component.html',
  styleUrls: ['devices.component.scss']
})
export class AdminUserDevicesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'details',
    'country',
    'browser',
    'device',
    'created',
    'confirmed',
    'ip'
  ];
  inProgress = false;
  permission = 0;
  selectedDevice?: DeviceItem;
  deviceCount = 0;
  devices: DeviceItem[] = [];
  user?: UserItem;
  filterUserId = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
    this.filterUserId = this.activeRoute.snapshot.params['userid'];
    this.permission = this.auth.isPermittedObjectCode('SYSTEM_USERS');
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadDevices();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showDetails(device: DeviceItem, content: any) {
    this.selectedDevice = device;
    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  confirmDevice(device: DeviceItem, content: any) {
    const requestData$ = this.adminService.confirmDevice(device.id);
    this.subscriptions.add(
      requestData$.subscribe(({ result }) => {
        const confirmModalRef = this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
        this.subscriptions.add(
          confirmModalRef.closed.subscribe(val => {
            this.loadDevices();
          })
        );
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  loadDevices(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getDevices(this.filterUserId).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.devices = list;
        this.deviceCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private loadUserData(): void {
    this.subscriptions.add(
      this.adminService.getUser(this.filterUserId).pipe(take(1)).subscribe(user => {
        this.user = user;
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
