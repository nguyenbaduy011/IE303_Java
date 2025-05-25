export const getFullName = (first_name: string, last_name: string) => {
  if (!first_name || !last_name) return "??";

  return first_name + " " + last_name;
};
