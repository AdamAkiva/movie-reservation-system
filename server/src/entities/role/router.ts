import { Router, json } from 'express';

import type { AuthenticationManager } from '../../server/services/index.ts';

import * as roleController from './controller.ts';

/**********************************************************************************/

function router(authentication: AuthenticationManager) {
  const router = Router()
    .get(
      '/roles',
      json({ limit: 0 }),
      authentication.httpAuthenticationMiddleware(),
      roleController.getRoles,
    )
    .post(
      '/roles',
      json({ limit: '4kb' }),
      authentication.httpAuthenticationMiddleware(),
      roleController.createRole,
    )
    .put(
      '/roles/:role_id',
      json({ limit: '4kb' }),
      authentication.httpAuthenticationMiddleware(),
      roleController.updateRole,
    )
    .delete(
      '/roles/:role_id',
      json({ limit: 0 }),
      authentication.httpAuthenticationMiddleware(),
      roleController.deleteRole,
    );

  return router;
}

/**********************************************************************************/

export { router };
