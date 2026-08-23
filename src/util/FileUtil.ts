export function toMultipart(
  data: Record<string, unknown>,
  files?: Record<string, File | File[]>,
) {
  const formData = new FormData();

  // JSON 파트
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  // 파일 파트
  if (files) {
    Object.entries(files).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file) => formData.append(key, file));
      } else {
        formData.append(key, value);
      }
    });
  }

  return formData;
}
