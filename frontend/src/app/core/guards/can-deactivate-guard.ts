import { CanDeactivateFn } from '@angular/router';
import { ICanComponentDeactivate } from '../models/canComponentDeactivate.model';

export const canDeactivateGuard: CanDeactivateFn<ICanComponentDeactivate> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  return component.canDeactivate ? component.canDeactivate() : true
};
