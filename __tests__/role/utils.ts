import { inArray } from 'drizzle-orm';

import * as serviceFunctions from '../../src/entities/role/service/index.js';
import type { Role } from '../../src/entities/role/service/utils.js';
import * as validationFunctions from '../../src/entities/role/validator.js';

import { randomString, VALIDATION, type ServerParams } from '../utils.js';

/**********************************************************************************/

type CreateRole = Omit<Role, 'id'>;

const { ROLE } = VALIDATION;

/**********************************************************************************/

async function seedRole(serverParams: ServerParams) {
  const { createdRoles, roleIds } = await seedRoles(serverParams, 1);

  return {
    createdRole: createdRoles[0]!,
    roleIds,
  };
}

async function seedRoles(serverParams: ServerParams, amount: number) {
  const { database } = serverParams;
  const handler = database.getHandler();
  const { role: roleModel } = database.getModels();

  const rolesToCreate = generateRolesData(amount);

  const createdRoles = await handler
    .insert(roleModel)
    .values(rolesToCreate)
    .returning({ id: roleModel.id, name: roleModel.name });

  return {
    createdRoles,
    roleIds: createdRoles.map(({ id }) => {
      return id;
    }),
  };
}

function generateRolesData(amount = 1) {
  const roles = [...Array(amount)].map(() => {
    return {
      name: randomString(ROLE.NAME.MAX_LENGTH.VALUE - 1),
    } as CreateRole;
  });

  return roles;
}

async function deleteRoles(serverParams: ServerParams, ...roleIds: string[]) {
  roleIds = roleIds.filter((roleId) => {
    return roleId;
  });
  if (!roleIds.length) {
    return;
  }

  const { database } = serverParams;
  const databaseHandler = database.getHandler();
  const { role: roleModel } = database.getModels();

  await databaseHandler.delete(roleModel).where(inArray(roleModel.id, roleIds));
}

/**********************************************************************************/

export {
  deleteRoles,
  generateRolesData,
  seedRole,
  seedRoles,
  serviceFunctions,
  validationFunctions,
  type CreateRole,
  type Role,
};
