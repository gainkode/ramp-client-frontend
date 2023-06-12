import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRole } from 'model/generated-models';

export class RoleSelector {
  name = '';
  id = '';
  selected = false;
}

@Component({
  selector: 'app-admin-role-select',
  templateUrl: './role-select.component.html'
})
export class AdminRoleSelectComponent {
  @Input() set roleList(vals: UserRole[]) {
    this.roleListInternal = vals.filter(x => x.code !== 'USER');
    this.updateState();
  }
  @Input() set userRoles(vals: string[]) {
    this.userRolesInternal = vals;
    this.updateState();
  }

  @Output() changed = new EventEmitter<string[]>();

  private roleListInternal: UserRole[] = [];
  private userRolesInternal: string[] = [];

  roleItems: RoleSelector[] = [];

  constructor() { }

  private updateState(): void {
    this.roleItems = this.roleListInternal.map(role => {
      return {
        id: role.code,
        name: role.name,
        selected: this.userRolesInternal.find(x => x === role.code) !== undefined
      } as RoleSelector
    });
    this.onChanged();
  }

  onChanged(): void {
    const selectedRoles = this.roleItems
      .filter(x => x.selected === true)
      .map(x => x.id);
    this.changed.emit(
      [ ... selectedRoles,
        'USER'
      ]);
  }
}
