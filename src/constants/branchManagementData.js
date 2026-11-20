import { GYM_AVATARS, GYM_COVER_IMAGE } from './gymOwnerData';

export const BRANCH_MEDIA = {
  downtownCover: GYM_COVER_IMAGE,
  bellevueCover: '',
  receptionCover: '',
  studioCover: '',
  managerLeadAvatar: '',
  trainerAvatar: GYM_AVATARS.trainerFemale,
  memberMaleAvatar: GYM_AVATARS.memberMale,
  coachMemberAvatar: GYM_AVATARS.coachMember,
  portraitAvatar: GYM_AVATARS.portrait,
  ownerAvatar: GYM_AVATARS.owner,
};

export const STAFF_CATEGORIES = [
  'Branch Manager',
  'Receptionist',
  'Trainer',
  'Dietitian',
  'Accountant',
  'Other Staff',
];

export const BRANCH_TYPES = [
  'Flagship Club',
  'Boutique Studio',
  'Conditioning Lab',
  'Express Studio',
  'Recovery & Wellness',
];

export const INITIAL_BRANCH_MANAGERS = [];

export const INITIAL_BRANCH_STAFF = [];

export const INITIAL_BRANCHES = [];

export const INITIAL_BRANCH_ACTIVITY_LOGS = [];
