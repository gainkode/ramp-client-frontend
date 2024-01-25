import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface IRequestOptions {
	headers?:
		| HttpHeaders
		| {
			[header: string]: string | string[];
		  };
	observe?: 'body';
	params?:
		| HttpParams
		| {
			[param: string]: string | string[];
		  };
	reportProgress?: boolean;
	responseType?: 'json'; // 'arraybuffer' | 'blob' | 'json' | 'text'
	withCredentials?: boolean;
}

export interface ISimpleResponse {
	success: boolean;
}