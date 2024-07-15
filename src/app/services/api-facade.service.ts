import { EnvService } from 'services/env.service';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IRequestOptions } from 'model/api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiFacadeService {
	constructor(private httpClient: HttpClient, private auth: AuthService) {}

	private get apiUrl(): string {
		return `${EnvService.api_server}`;
	}

	public get<T>(uri: string, options: IRequestOptions = {}): Observable<T> {
		return this.httpClient.get<T>(this.makeUri(this.apiUrl, uri), this.concatAuthOptions(options));
	}

	public getFile(uri: string): Observable<Blob> {
		return this.httpClient.get(this.makeUri(this.apiUrl, uri), {
			headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.token),
			responseType: 'blob'
		});
	}

	public post<T>(uri: string, body: any = {}, options: IRequestOptions = {}): Observable<T> {
		// return this.httpClient.post<T>(this.makeUri(this.apiUrl, uri), body, this.concatAuthOptions(options));
		return this.httpClient.post<T>(this.makeUri('https://8e14-46-172-248-169.ngrok-free.app', uri), body, this.concatAuthOptions(options));
	}

	public postFormData(uri: string, body: FormData): Observable<HttpEvent<Object>> {
		return this.httpClient.post(this.makeUri(this.apiUrl, uri), body, {
			headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.token),
			observe: 'events',
			reportProgress: true
		});
	}

	public put<T>(uri: string, body: any = {}, options: IRequestOptions = {}): Observable<T> {
		return this.httpClient.put<T>(this.makeUri(this.apiUrl, uri), body, this.concatAuthOptions(options));
	}

	public delete<T>(uri: string, options: unknown = {}): Observable<T> {
		return this.httpClient.delete<T>(this.makeUri(this.apiUrl, uri), this.concatAuthOptions(options));
	}

	private makeUri(...chunks: (string | number)[]): string {
		return chunks.join('/');
	}

	private concatAuthOptions(options: IRequestOptions) {
		const auth = { headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.token) };
		return { ... options, ...auth };
	}
}
