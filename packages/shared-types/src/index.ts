// This file will hold your common TypeScript types.
// For example, the types for the user-defined form fields.

export type Message = {
  text: string;
  timestamp: Date;
};

export type UserDefinedField = {
  id: string;
  name: string;
  type: "text" | "number" | "checkbox" | "date" | "select";
  options?: string[]; // For 'select' type
  required?: boolean;
};

export type FormConfig = {
  formId: string;
  title: string;
  description?: string;
  fields: UserDefinedField[];
};
