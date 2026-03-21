import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req?.headers?.authorization;

    if (!authHeader) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<TUser = unknown>(err: Error | null, user: TUser): TUser {
    if (err) {
      throw err;
    }
    return user || (null as unknown as TUser);
  }
}
