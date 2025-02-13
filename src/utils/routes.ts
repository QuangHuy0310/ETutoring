import { AuthModule, BlogModule, ChatModule, CommentModule, UserModule } from '@modules';
import { Routes } from '@nestjs/core';

export const routes: Routes = [
  {
    path: 'api/v1',
    children: [
      { path: '/users', module: UserModule },
      { path: '/auth', module: AuthModule },
      { path: '/chat', module: ChatModule },
      { path: '/blog', module: BlogModule },
      { path: '/comments', module: CommentModule },
    ],
  },
];
