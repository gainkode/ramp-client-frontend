import { Injectable } from "@angular/core";
import { WidgetStage } from "../model/payment-base.model";

@Injectable()
export class WidgetPagerService {
    get stageId(): string {
        return (this._swapStage === '') ? this._stageId : this._swapStage;
    }

    get title(): string {
        return this._title;
    }

    get step(): number {
        return this._step;
    }

    private _swapStage = '';
    private _stageId = '';
    private _title = '';
    private _step = 0;
    private _stages: WidgetStage[] = [];

    init(id: string, stageTitle: string): void {
        this._swapStage = '';
        this._title = stageTitle;
        this._stageId = id;
        this._step = 1;
    }

    removeLastStage(): WidgetStage {
        return this._stages.splice(this._stages.length - 1, 1)[0];
    }

    goBack(): WidgetStage | undefined {
        if (this._stages.length > 0) {
            const lastStage = this.removeLastStage();
            this._stageId = lastStage.id;
            this._title = lastStage.title;
            this._step = lastStage.step;
            return lastStage;
        }
        return undefined;
    }

    nextStage(id: string, name: string, stepId: number, summaryVisible: boolean): void {
        const store = (
            this._stageId !== 'initialization' &&
            this._stageId !== 'register' &&
            this._stageId !== 'login_auth' &&
            this._stageId !== 'code_auth');
        this._swapStage = '';
        if (store) {
            this._stages.push({
                id: this.stageId,
                title: this.title,
                step: this.step,
                summary: summaryVisible
            } as WidgetStage);
        }
        this._stageId = id;
        this._title = name;
        this._step = stepId;
    }

    removeStage(stage: string): void {
        const stageIndex = this._stages.findIndex(x => x.id === stage);
        if (stageIndex > -1) {
            this._stages.splice(stageIndex, 1);
        }
    }

    swapStage(id: string): string {
        const res = this._stageId;
        if (id === this._stageId) {
            this._swapStage = '';
        } else {
            this._swapStage = id;
        }
        return res;
    }
}
