import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {
	private themeSubject = new BehaviorSubject<string>('light'); // default to light theme
	theme$ = this.themeSubject.asObservable();

	toggleTheme(): void {
		const currentTheme = this.themeSubject.getValue();
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		this.themeSubject.next(newTheme);
	}
}