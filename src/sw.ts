import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

import { RouteHandlerCallback } from "workbox-core/types.js";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { serviceworker } from "./fileService";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const filehanlde = [];
let storedDirHanlde: FileSystemDirectoryHandle;

const writeFile = async (
  folderHanlder: FileSystemDirectoryHandle,
  file: string | Blob,
  filename: string
) => {
  //   const writable = await filehanlde[0].createWritable();
  console.log(folderHanlder);
  const newImageFilehanlder = await folderHanlder.getFileHandle(filename, {
    create: true,
  });
  console.log(newImageFilehanlder);
  const writable = await newImageFilehanlder.createWritable();

  // Write the contents of the file to the stream.
  await writable.write(file);

  // Close the file and write the contents to disk.
  await writable.close();
};

const setFolderFilehandle = async (
  directoryHanlde: FileSystemDirectoryHandle
) => {
  for await (const [key, value] of directoryHanlde.entries()) {
    console.log({ key, value });
    filehanlde.push(value);
  }
};

serviceworker.onmessage = (event) => {
  console.log(event.data);
  const { data } = event;
  const { handler, image } = data;

  if (handler) {
    storedDirHanlde = handler;
    setFolderFilehandle(handler);
  }

  if (image && storedDirHanlde) {
    writeFile(storedDirHanlde, image, "newimage.png");
  }
};

const customCallback: RouteHandlerCallback = async function ({
  event,
  request,
  url,
  params,
}) {
  console.log({ event, request, url, params });
  let subFolderHanlder: FileSystemDirectoryHandle;
  try {
    subFolderHanlder = await storedDirHanlde.getDirectoryHandle(
      url.pathname.split("/")[1],
      { create: true }
    );
  } catch (e) {
    subFolderHanlder = storedDirHanlde;
  }
  try {
    subFolderHanlder = await subFolderHanlder.getDirectoryHandle(
      url.pathname.split("/")[2],
      { create: true }
    );
  } catch (e) {
    subFolderHanlder = storedDirHanlde;
  }

  const res = await fetch(request);
  const blob = await res.blob();

  if (blob && storedDirHanlde) {
    writeFile(subFolderHanlder, blob, Date.now().toString() + ".png");
  }

  const newPromise: Promise<Response> = new Promise((resolve, reject) => {
    if (blob) {
      resolve(new Response(blob));
    } else {
      reject("no blob");
    }
  });

  return newPromise;
};

registerRoute(
  ({ url }) => url.origin === "https://picsum.photos",
  // && url.pathname.startsWith("/200/300"),
  customCallback
);

/**
 * We use CacheFirst for images because, images are not going to change very often,
 * so it does not make sense to revalidate images on every request.
 *
 * @see https://developers.google.com/web/tools/workbox/guides/common-recipes#caching_images
 */
// registerRoute(
// 	({ request }) => request.destination === 'image',
// 	new CacheFirst({
// 		cacheName: 'images',
// 		plugins: [
// 			new CacheableResponsePlugin({
// 				statuses: [0, 200],
// 			}),
// 			new ExpirationPlugin({
// 				maxEntries: 60,
// 				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
// 			}),
// 		],
// 	})
// );

// @see https://developers.google.com/web/tools/workbox/guides/common-recipes#cache_css_and_javascript_files
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

self.skipWaiting();
clientsClaim();
