export function loadImageFromUrl(value) {
  let url;

  try {
    url = new URL(value.trim());
  } catch {
    return Promise.reject(new Error("Enter a valid image URL."));
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return Promise.reject(new Error("Image URLs must use HTTP or HTTPS."));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error("The URL does not point to a valid image."));
        return;
      }

      resolve(image);
    };
    image.onerror = () => reject(new Error("Could not load an image from this URL."));
    image.src = url.href;
  });
}
