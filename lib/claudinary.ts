import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { CLOUDINARY } from "./env";

const {
  cloudName,
  uploadPreset: uploadUnsignedPreset,
  uploadSignedPreset,
  apiKey,
} = CLOUDINARY;

/**
 * Callable Firebase function
 *
 */
const firebaseSigner = httpsCallable<object, string>(
  getFunctions(),
  "cloudinaryUploadSignRequestApp",
);

type CloudinaryUploadIMageMeta = {
  /**
   * Authenticated user ID
   */
  uid: string;
  /**
   * Image title/caption
   */
  title?: string;
  /**
   * Image description/alt
   */
  description?: string;
  /**
   * Image tags
   */
  tags: string[];
  /**
   * Image location
   */
  location?: { latitude: number; longitude: number };
};
/**
 * RN FormData file part — build from an expo-image-picker asset:
 * { uri: asset.uri, type: asset.mimeType ?? "image/jpeg", name: asset.fileName ?? "upload.jpg" }
 */
export type UploadFileData = { uri: string; type?: string; name?: string };

/**
 * Upload image file to Cloudinary
 *
 * @param data image data
 * @param meta image meta data
 * @param progressListener progress listener
 * @param isSigned whether to use the signed or unsigned upload preset
 * @return {Promise}
 */
export async function uploadFile(
  data: UploadFileData,
  meta: CloudinaryUploadIMageMeta,
  progressListener?: (event: {
    loaded: number;
    total: number;
    progress: number;
  }) => void,
  isSigned: boolean = true,
): Promise<{ imageUrl: string; cloudinaryId: string }> {
  const { uid, title, description, tags = [], location } = meta;

  const fd = new FormData();
  // RN's FormData accepts {uri,type,name} file parts, but the lib.dom
  // typings only know Blob|string — cast for TS, runtime is fine.
  fd.append("file", data as unknown as Blob); // should not be signed - so just append it

  // these params will be appended later always but if necessary it they should be signed
  const paramsToSign = new Map();
  const uploadPreset = isSigned ? uploadSignedPreset : uploadUnsignedPreset;
  if (uploadPreset) {
    paramsToSign.set("upload_preset", uploadPreset);
  }

  // these are custom metadata and will be accessible in the response or notification hook
  // as context.custom.XXX
  paramsToSign.set(
    "context",
    createContext({
      caption: title,
      alt: description,

      uid,
      ...location, // if it's null/undefined it is just skipped
    }),
  );

  // Optional - add tags , if specified they will replace the default set in the upload preset
  if (tags.length) paramsToSign.set("tags", tags.join(","));
  if (isSigned) {
    // request the Cloudinary to extract the Exif image metadata
    paramsToSign.set("image_metadata", true);
    paramsToSign.set("timestamp", timestamp());

    // call the signing function (e.g. on a server or Firebase function) to sign 'paramsToSign'
    // https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_api
    const signature = await firebaseSigner(mapToObj(paramsToSign));

    // should not be signed - so just append it
    fd.append("api_key", apiKey!);
    fd.append("signature", signature.data);
  }
  // append the other params
  paramsToSign.forEach((val, key) => fd.append(key, val));

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    // Update progress (can be used to show progress indicator)
    if (progressListener) {
      // Reset the upload progress bar
      progressListener({ loaded: 0, total: 0, progress: 0 });

      xhr.upload.addEventListener("progress", function (e) {
        const progress = Math.round((e.loaded * 100.0) / e.total);
        progressListener({ loaded: e.loaded, total: e.total, progress });
      });
    }

    xhr.onreadystatechange = function () {
      // if readystate 4 - DONE
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          // File uploaded successfully
          const response = JSON.parse(xhr.responseText);
          resolve({
            imageUrl: (response.secure_url || response.url) as string,
            cloudinaryId: response.public_id as string,
          });
        } else {
          const error = new Error(
            "Failed to upload image to Cloudinary",
          ) as Error & { data?: { status: number } };
          // attach the known reason
          error.data = { status: xhr.status };
          reject(error);
        }
      }
    };

    xhr.send(fd);
  });
}

export function createThumbUrl(cloudinaryUrl: string): string {
  // url: https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
  // Create a thumbnail of the uploaded image, with 150px width
  // thumbUrl: https://res.cloudinary.com/cloudName/image/upload/w_150,c_scale/v1483481128/public_id.jpg
  return cloudinaryUrl.replace("upload/", "upload/w_150,c_scale/");
}

function mapToObj(map: Map<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}; // Object.create(null);
  for (const [k, v] of map) {
    obj[k] = v;
  }
  return obj;
}

function timestamp(): number {
  return Math.floor(new Date().getTime() / 1000);
}

function createContext(ctx: Record<string, unknown>) {
  return Object.keys(ctx)
    .filter((key) => !!ctx[key]) // skip undefined values
    .map((key) => `${key}=${ctx[key]}`)
    .join("|");
}
