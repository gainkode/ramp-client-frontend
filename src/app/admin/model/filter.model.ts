import { TransactionSource, UserType } from '../../model/generated-models';
import { EmptyObject } from 'apollo-angular/types';

export class Filter {
  public accountTypes?: Array<UserType>;
  public assets?: Array<string>;
  public countries?: Array<string>; // code3
  public sources?: Array<TransactionSource>;
  public users?: Array<string>;
  public widgets?: Array<string>;
  public search?: string;

  constructor(filterValues: EmptyObject) {
    if (filterValues.accountTypes) {
      this.accountTypes = filterValues.accountTypes;
    }

    if (filterValues.assets) {
      this.assets = filterValues.assets;
    }

    if (filterValues.countries) {
      this.countries = filterValues.countries;
    }

    if (filterValues.sources) {
      this.sources = filterValues.sources;
    }

    if (filterValues.users) {
      this.users = filterValues.users;
    }

    if (filterValues.widgets) {
      this.widgets = filterValues.widgets;
    }

    if (filterValues.search) {
      this.search = filterValues.search;
    }
  }

}
