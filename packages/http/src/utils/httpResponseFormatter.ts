export interface JsonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
  error?: any;
}

export class HttpResponseFormatter {
  static success(data: any, message = 'Success', statusCode = 200): JsonResponse {
    return { success: true, statusCode, message, data };
  }

  static error(message = 'Error', statusCode = 500, error?: any): JsonResponse {
    return { success: false, statusCode, message, error };
  }
}
