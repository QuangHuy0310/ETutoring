import { AuthModule, UserModule } from '@modules';
import { Routes } from '@nestjs/core';

export const routes: Routes = [
  {
    path: 'api/v1',
    children: [
      { path: '/users', module: UserModule },
      { path: '/auth', module: AuthModule },
    ],
  },
];
