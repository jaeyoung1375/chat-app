import { useMutation } from "@tanstack/react-query";
import { fileUpload } from "./file.api";

export const useFileUploadMutation = () => {
  return useMutation({
    mutationFn: (file: File) => fileUpload(file),
  });
};
