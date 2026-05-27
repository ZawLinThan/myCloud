type AuthUserDocument = {
  _id: {
    toString: () => string;
  };
  accountId: string;
  avatar?: string | null;
  email: string;
  files?: unknown[];
  fullName: string;
};

export const serializeAuthUser = (user: AuthUserDocument) => {
  return {
    _id: user._id.toString(),
    accountId: user.accountId,
    avatar: user.avatar ?? null,
    email: user.email,
    files: user.files ?? [],
    fullName: user.fullName,
  };
};
