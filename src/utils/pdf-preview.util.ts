export const createPdfObjectUrlFromBase64 = (
  contentBase64: string,
  mimeType = "application/pdf",
) => {
  const binaryString = window.atob(contentBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  const pdfBlob = new Blob([bytes.buffer], { type: mimeType });
  return window.URL.createObjectURL(pdfBlob);
};

export const createPdfObjectUrlFromBlob = (
  fileBlob: Blob,
  mimeType = "application/pdf",
) => {
  const pdfBlob =
    fileBlob.type && fileBlob.type === mimeType
      ? fileBlob
      : new Blob([fileBlob], { type: mimeType });

  return window.URL.createObjectURL(pdfBlob);
};

type RenderPdfImageOptions = {
  maxWidth?: number;
};

let hasConfiguredPdfWorker = false;

const ensurePdfWorker = async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!hasConfiguredPdfWorker) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url,
    ).toString();
    hasConfiguredPdfWorker = true;
  }

  return pdfjs;
};

const renderPdfFirstPageToImageDataUrlFromBytes = async (
  bytes: Uint8Array,
  mimeType = "application/pdf",
  options?: RenderPdfImageOptions,
) => {
  if (bytes.length === 0) {
    throw new Error("PDF content is empty.");
  }

  if (!mimeType.toLowerCase().includes("pdf")) {
    throw new Error("File is not a PDF document.");
  }

  const pdfjs = await ensurePdfWorker();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdfDocument = await loadingTask.promise;

  try {
    const page = await pdfDocument.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const maxWidth = Math.max(320, options?.maxWidth ?? 920);
    const scale = Math.min(2.2, Math.max(1, maxWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context is not available.");
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toDataURL("image/png");
  } finally {
    await pdfDocument.destroy();
    await loadingTask.destroy();
  }
};

export const renderPdfFirstPageToImageDataUrl = async (
  contentBase64: string,
  mimeType = "application/pdf",
  options?: RenderPdfImageOptions,
) => {
  if (!contentBase64) {
    throw new Error("PDF content is empty.");
  }
  const binaryString = window.atob(contentBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return renderPdfFirstPageToImageDataUrlFromBytes(bytes, mimeType, options);
};

export const renderPdfFirstPageToImageDataUrlFromBlob = async (
  fileBlob: Blob,
  mimeType = "application/pdf",
  options?: RenderPdfImageOptions,
) => {
  const arrayBuffer = await fileBlob.arrayBuffer();
  return renderPdfFirstPageToImageDataUrlFromBytes(
    new Uint8Array(arrayBuffer),
    mimeType || fileBlob.type || "application/pdf",
    options,
  );
};

export const renderPdfPagesToImageDataUrlsFromBlob = async (
  fileBlob: Blob,
  mimeType = "application/pdf",
  options?: RenderPdfImageOptions,
) => {
  const arrayBuffer = await fileBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const effectiveMimeType = mimeType || fileBlob.type || "application/pdf";

  if (bytes.length === 0) {
    throw new Error("PDF content is empty.");
  }

  if (!effectiveMimeType.toLowerCase().includes("pdf")) {
    throw new Error("File is not a PDF document.");
  }

  const pdfjs = await ensurePdfWorker();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdfDocument = await loadingTask.promise;

  try {
    const maxWidth = Math.max(320, options?.maxWidth ?? 1240);
    const pageImages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2.4, Math.max(1, maxWidth / baseViewport.width));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context is not available.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      pageImages.push(canvas.toDataURL("image/png"));
    }

    return pageImages;
  } finally {
    await pdfDocument.destroy();
    await loadingTask.destroy();
  }
};
