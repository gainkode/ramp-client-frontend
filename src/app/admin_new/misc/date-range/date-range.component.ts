import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, FormBuilder, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { getFormattedUtcDate } from 'src/app/utils/utils';
import { DateFormatAdapter } from './date-format.adapter';
import { DateParserFormatter } from './date.formatter';

@Component({
  selector: 'app-admin-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: DateFormatAdapter },
    { provide: NgbDateParserFormatter, useClass: DateParserFormatter }
  ],
  viewProviders: [{
    provide: ControlContainer,
    useFactory: (controlContainer: ControlContainer) => controlContainer,
    deps: [[new SkipSelf(), ControlContainer]]
  }]
})
export class AdminDateRangeComponent {
  @Input() startField: AbstractControl | null = null;
  @Input() endField: AbstractControl | null = null;

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;
  toDate: NgbDate | null = null;

  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter) { }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) &&
      date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) { return this.toDate && date.after(this.fromDate) && date.before(this.toDate); }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) ||
      this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    if (input === '') {
      return null;
    }
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  onDateChanged(data: any): void {
    const start = `${this.fromDate?.day}/${this.fromDate?.month}/${this.fromDate?.year}`;
    const end = `${this.toDate?.day}/${this.toDate?.month}/${this.toDate?.year}`;
    this.startField?.setValue(getFormattedUtcDate(start));
    this.endField?.setValue(getFormattedUtcDate(end));
  }
}
