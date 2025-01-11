import { User } from '@entities';

export type AuthorizationRequest = Request & {
  user: User;
};
