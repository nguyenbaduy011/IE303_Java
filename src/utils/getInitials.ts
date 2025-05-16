import { UserType } from "@/types/types";

export const getInitials = (userInput: UserType) => {
  return `${userInput.first_name.charAt(0)}${userInput.last_name.charAt(0)}`;
};
