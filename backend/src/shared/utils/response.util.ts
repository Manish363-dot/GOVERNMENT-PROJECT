import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: { page?: number; limit?: number; total?: number }
) => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  errors?: any
) => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(errors ? { errors } : {}),
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
};
