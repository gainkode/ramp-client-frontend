import { getCryptoSymbol, getCurrencySign } from '../utils/utils';
import { AssetAddressShort, FiatVault } from './generated-models';
import { CurrencyView } from './payment.model';

export class WalletItem {
	id = '';
	originalId = '';
	code = '';
	vaultOriginalId = '';
	vault = '';
	type = '';
	address = '';
	addressFormat = '';
	asset = '';
	symbol = '';
	available = 0;
	availableFiat = 0;
	total = 0;
	totalFiat = 0;
	name = '';
	crypto = true;

	private pIconUrl = '';
	private fiat = '';
	private pCurrencyName = '';
	private pFullName = '';

	constructor(data: AssetAddressShort | null, defaultFiat: string, currency: CurrencyView | undefined) {
		this.crypto = true;
		if (data) {
			this.fiat = defaultFiat;
			this.id = data.vaultId ?? '';
			this.originalId = data.originalId ?? '';
			this.vaultOriginalId = data.vaultOriginalId ?? '';
			this.vault = data.vaultId ?? '';
			this.address = data.address ?? '';
			this.addressFormat = data.addressFormat ?? '';
			this.asset = currency?.symbol ?? '';
			if (this.asset === '') {
				this.asset = data.assetId ?? '';
			}
			this.total = data.total ?? 0;
			this.totalFiat = data.totalFiat ?? 0;
			this.available = data.available ?? 0;
			this.availableFiat = data.availableFiat ?? 0;
			this.name = data.vaultName ?? '';
			if (this.asset !== '' && currency) {
				this.pIconUrl = `assets/svg-crypto/${getCryptoSymbol(currency.code).toLowerCase()}.svg`;
			}
			if (currency) {
				this.code = currency.code;
				this.pCurrencyName = `${currency.display} - ${currency.name.toUpperCase()}`;
				this.pFullName = currency.name;
				this.symbol = currency.display;
			} else {
				this.pCurrencyName = this.asset;
				this.pFullName = this.asset;
				this.symbol = this.asset;
				this.code = this.asset;
			}
		}
	}

	get icon(): string {
		return this.pIconUrl;
	}

	get availableValue(): string {
		return `${getCurrencySign(this.fiat)}${this.availableFiat.toFixed(2)}`;
	}

	get availableFullFiat(): string {
		return `${getCurrencySign(this.asset)}${this.available.toFixed(2)}`;
	}

	get totalValue(): string {
		return `${getCurrencySign(this.fiat)}${this.totalFiat.toFixed(2)}`;
	}

	get totalFullFiat(): string {
		return `${getCurrencySign(this.asset)}${this.total.toFixed(2)}`;
	}

	get nameValue(): string {
		const limit = 13;
		return (this.name.length > limit) ? `${this.name.substr(0, limit)}...` : this.name;
	}

	get currencyName(): string {
		return this.pCurrencyName;
	}

	get fullName(): string {
		return this.pFullName;
	}

	setName(n: string): void {
		this.name = n;
	}

	setFiat(data: FiatVault, defaultFiat: string) {
		this.crypto = false;
		if (data) {
			this.fiat = defaultFiat;
			this.id = data.fiatVaultId ?? '';
			this.vault = data.fiatVaultId ?? '';
			this.asset = data.currency ?? '';
			this.symbol = data.currency ?? '';
			this.available = data.balance ?? 0;
			this.availableFiat = data.generalBalance ?? 0;
			this.total = data.balance ?? 0;
			this.totalFiat = data.generalBalance ?? 0;
			this.name = `${this.asset} wallet`;
			this.pCurrencyName = this.asset;
			this.pFullName = `${this.asset} wallet`;
		}
	}
}
