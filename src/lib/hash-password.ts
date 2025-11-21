import bcrypt from 'bcrypt';

export async function hashPassword(unhashed: string) {
  const hashed = await bcrypt.hash(unhashed, 10);

  return hashed;
}

export async function comparePasswords(unhashed: string, hashed: string) {
  return bcrypt.compare(unhashed, hashed);
}
