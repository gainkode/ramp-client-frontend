import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats } from 'src/app/model/generated-models';
import { Subscription } from 'rxjs';
import { DashboardModel } from 'src/app/model/dashboard.model';

@Component({
    templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
    inProgress = false;
    errorMessage = '';
    stats!: DashboardModel;
    private pStatsSubscription!: any;

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private adminService: AdminDataService,
        private router: Router) {
        this.stats = new DashboardModel(null);
    }

    ngOnInit(): void {
        const statsData = this.adminService.getDashboardStats();
        if (statsData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pStatsSubscription = statsData.valueChanges.subscribe(({ data }) => {
                this.stats = new DashboardModel(data.getDashboardStats);
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load dashboard data');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pStatsSubscription;
        if (s !== undefined) {
            (this.pStatsSubscription as Subscription).unsubscribe();
        }
    }

    refresh(): void {
        const statsData = this.adminService.getDashboardStats();
        if (statsData !== null) {
            statsData.refetch();
        }
    }

    test() {
        this.refresh();
    }
}
