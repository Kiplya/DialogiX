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
  users: { id: string; username: string; isOnline: boolean }[];
  hasMore: boolean;
};

export type GetSelfUserRes = {
  id: string;
  email: string;
  username: string;
  registredAt: Date;
  isAdmin: boolean;
};

export type UpdatePasswordReq = {
  newPassword: string;
} & PasswordValidationReq;

export type UpadateUsernameReq = {
  username: string;
};

export type GetChatsByUserIdRes = {
  username: string;
  userId: string;
  isOnline: boolean;
  lastMessage: string;
  createdAt: Date;
}[];

export type GetUserByUsernameRes = {
  id: string;
  username: string;
  isOnline: boolean;
};
