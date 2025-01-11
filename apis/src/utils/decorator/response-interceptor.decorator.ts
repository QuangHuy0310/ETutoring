import { SetMetadata, UseGuards } from '@nestjs/common';

export const DisableInterceptor = (disable: boolean) =>
  SetMetadata('disableInterceptor', disable);

export const DisableInterceptorGuard = (condition: boolean) => {
  if (condition) {
    return UseGuards();
  } else {
    return (target, key, descriptor) => descriptor;
  }
};
