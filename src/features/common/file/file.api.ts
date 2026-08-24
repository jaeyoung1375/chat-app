import { postForm } from "@/util/AxiosUtil";
import { FileResponse } from "./file.type";

/**
 * 공통 파일 전송.
 */
export const fileUpload = (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  return postForm<FileResponse>(`/api/v1/file/upload`, formData);
};
