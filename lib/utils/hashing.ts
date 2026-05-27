import bcrypt from 'bcryptjs';

const salt = await bcrypt.genSalt(10);

const hash = (param: string) => {
  return bcrypt.hash(param, salt);
};

const verify = (param: string, paramHash: string) => {
  return bcrypt.compare(param, paramHash);
};

const hashingService = {
  hash,
  verify,
};
export default hashingService;
