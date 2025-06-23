export const ResStatus = {
  INTERNAL_SERVER_ERROR: 500,
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_CREDENTIALS: 400,
  NO_CONTENT: 204,
} as const;

export type BaseRes = {
  message: string;
};

export type RegistrationReq = {
  email: string;
  username: string;
  password: string;
};

export type LoginReq = {
  email: string;
  password: string;
};

export type LoginRes = {
  accessToken: string;
  isAdmin: boolean;
} & BaseRes;

export type UsernameValidationReq = {
  username: string;
};

export type EmailValidationReq = {
  email: string;
};

export type PasswordValidationReq = {
  password: string;
};

export type JwtPayload = {
  tokenId: string;
  userId: string;
  userAgent: string;
  isAdmin: boolean;
};

export type GetManyUsersRes = {
  users: { id: string; username: string; avatar: string | null }[];
  hasMore: boolean;
};
