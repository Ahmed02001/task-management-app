import bcrypt from "bcrypt";

export async function hashPassword(data) {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(data, salt);
  return hashedPass;
}

export async function comparePassword(plainText, hashText) {
  const isMatch = await bcrypt.compare(plainText, hashText);
  return isMatch;
}
