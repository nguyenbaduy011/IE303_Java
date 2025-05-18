import { UserFullShape } from "@/types/types";

export const getFullName = (userInput: UserFullShape) => {
  if (!userInput) return "??";
  return userInput.first_name + userInput.last_name;
};
