export type FormFieldType = 'TEXT' | 'TEXTAREA' | 'URL' | 'FILE' | 'SELECT';

export interface FormField {
  id: number;
  jobId: number;
  fieldName: string;
  label: string;
  fieldType: FormFieldType;
  required: boolean;
  options: string[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormFieldRequest {
  fieldName?: string;
  label: string;
  fieldType: FormFieldType;
  required: boolean;
  options: string[];
  displayOrder?: number;
}

export interface FormFieldDraft {
  id?: number;
  fieldName?: string;
  label: string;
  fieldType: FormFieldType;
  required: boolean;
  options: string[];
  displayOrder: number;
}

export const emptyFormField = (displayOrder: number): FormFieldDraft => ({
  label: '',
  fieldType: 'TEXT',
  required: false,
  options: [],
  displayOrder,
});

export const toFormFieldDraft = (field: FormField, index: number): FormFieldDraft => ({
  id: field.id,
  fieldName: field.fieldName,
  label: field.label,
  fieldType: field.fieldType,
  required: field.required,
  options: field.options || [],
  displayOrder: index,
});
