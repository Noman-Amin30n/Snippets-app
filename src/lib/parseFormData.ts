export type UploadedFormData<T> = {
  [K in keyof T]: T[K] extends File ? File : string;
};

export async function parseFormData<T>(formData: FormData): Promise<UploadedFormData<T>> {
  const result: Partial<UploadedFormData<T>> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      result[key as keyof T] = value as UploadedFormData<T>[keyof T];
    } else {
      result[key as keyof T] = value.toString() as UploadedFormData<T>[keyof T];
    }
  }

  return result as UploadedFormData<T>;
}