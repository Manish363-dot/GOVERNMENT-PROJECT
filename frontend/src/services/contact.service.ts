import { api } from './api';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  referenceId?: string;
}

export const contactService = {
  submitInquiry: (data: ContactFormData) => api.post<ContactFormResponse>('/contact', data),
};
