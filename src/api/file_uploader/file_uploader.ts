import { imageToWebp } from "imgtowebp";
import axiosInstance from "@/axios/axios-instance";

const UPLOADS_API_PATH = "/uploads";
const RENDER_PATH = "/uploads/render";

const WEBP_CONVERSION_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  targetBytes: 300_000,
  maxQuality: 0.82,
  minQuality: 0.45,
  returnFile: true,
} as const;

const canConvertFileToWebp = (file: File) =>
  file.type.startsWith("image/") && file.type !== "image/svg+xml";

const buildWebpFallbackFile = (originalFile: File, blob: Blob) => {
  const baseName = originalFile.name.replace(/\.[^/.]+$/, "") || "image";

  return new File([blob], `${baseName}.webp`, {
    type: blob.type || "image/webp",
    lastModified: originalFile.lastModified || Date.now(),
  });
};

const prepareFileForUpload = async (file: File): Promise<File> => {
  if (!canConvertFileToWebp(file)) return file;

  try {
    const result = await imageToWebp(file, WEBP_CONVERSION_OPTIONS);

    if (result.isWebp && result.file) {
      return result.file;
    }

    if (result.isWebp) {
      return buildWebpFallbackFile(file, result.blob);
    }
  } catch (error) {
    console.warn("Failed to convert image to WebP before upload.", error);
  }

  return file;
};

/**
 * Upload a file through the BPLO backend. R2 credentials remain server-side.
 */
export async function uploadFileInChunks(
  file: File,
  folder: string,
): Promise<string> {
  const response = await axiosInstance.post(UPLOADS_API_PATH, file, {
    params: { folder, filename: file.name },
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  return String(response.data?.url ?? "");
}

export interface UploadedImage {
  folder: string;
  filename: string;
  file: File;
}

/**
 * Extract a parameter from a URL.
 */
export function extractUrlParam(url: string, param: string): string {
  const selectedUrl = new URL(url, window.location.origin);
  return selectedUrl.searchParams.get(param) || "";
}

/**
 * Build a URL served by the BPLO backend from private R2 storage.
 */
export function getImageRenderUrl(folder: string, filename: string): string {
  return axiosInstance.getUri({
    url: RENDER_PATH,
    params: { folder, filename },
  });
}

/**
 * Upload a file via chunk upload and return { folder, filename } for DB storage.
 */
export async function uploadImageFile(
  file: File,
  folder: string,
): Promise<UploadedImage> {
  const uploadReadyFile = await prepareFileForUpload(file);
  const url = await uploadFileInChunks(uploadReadyFile, folder);
  return {
    folder: extractUrlParam(url, "folder"),
    filename: extractUrlParam(url, "filename"),
    file: uploadReadyFile,
  };
}

/**
 * Upload a file via chunk upload and return { folder, filename } for DB storage.
 */
export async function uploadImageFileWithRandomFolder(
  file: File,
  initialFolder: string,
): Promise<UploadedImage> {
  const uploadReadyFile = await prepareFileForUpload(file);
  const generatedFolder = `${initialFolder}/${crypto.randomUUID()}`;
  const url = await uploadFileInChunks(uploadReadyFile, generatedFolder);
  return {
    folder: extractUrlParam(url, "folder"),
    filename: extractUrlParam(url, "filename"),
    file: uploadReadyFile,
  };
}

/**
 * To upload a file, use this sample code:
 *
 * const htmlInputFileRef = useRef<HTMLInputElement>(null);
 * const blob = await new Promise<Blob | null>((resolve) => htmlInputFileRef.current?.files?.[0]?.arrayBuffer().then(resolve));
 * if (!blob) return;
 * const profileFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
 * const { folder, filename } = await uploadImageFileWithRandomFolder(profileFile, `la-trinidad/profile/picture`);
 * const url = getImageRenderUrl(folder, filename);
 */

/**
 * Delete a file from the BPLO backend and R2.
 */
export async function deleteFile(
  folder: string,
  filename: string,
): Promise<{ message: string }> {
  const params = new URLSearchParams({ folder, filename });
  const response = await axiosInstance.delete(UPLOADS_API_PATH, { params });
  return response.data;
}

/**
 * Delete a file from the BPLO backend based on its rendered URL.
 */
export async function deleteRenderedFileUrl(
  url: string,
): Promise<{ message: string }> {
  const folder = extractUrlParam(url, "folder");
  const filename = extractUrlParam(url, "filename");
  return deleteFile(folder, filename);
}
