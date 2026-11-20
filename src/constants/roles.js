export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  GYM_OWNER: 'gym_owner',
  MEMBER: 'member',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.GYM_OWNER]: 'Gym Owner',
  [ROLES.MEMBER]: 'Member',
};

export const ROLE_HOME_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.GYM_OWNER]: '/gym/dashboard',
  [ROLES.MEMBER]: '/member/dashboard',
};
