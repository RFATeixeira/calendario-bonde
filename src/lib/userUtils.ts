interface UserData {
  uid: string;
  displayName: string;
  customLetter?: string;
}

export function getUserDisplayLetter(user: UserData): string {
  return user.customLetter || user.displayName.charAt(0).toUpperCase();
}