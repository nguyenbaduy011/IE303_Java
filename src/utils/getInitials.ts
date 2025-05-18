import { UserFullShape } from "@/types/types";

export const getInitials = (userInput: UserFullShape) => {
  if (!userInput) return "??";
  return `${userInput.first_name.charAt(0)}${userInput.last_name.charAt(0)}`.toUpperCase();
};
