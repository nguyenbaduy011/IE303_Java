export const formatDateShort = (dateInput: string | Date): string => {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (e) {
    console.log(e);
    return "";
  }
};

export const formatDateLong = (dateInput: string | Date): string => {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    console.log(e);
    return "";
  }
};
  