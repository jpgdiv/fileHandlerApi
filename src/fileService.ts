export const client = new BroadcastChannel("client");
export const serviceworker = new BroadcastChannel("service_worker");

let folderHanlder;

async function verifyPermission(
  fileHandle: FileSystemDirectoryHandle,
  withWrite: boolean
) {
  const opts: FileSystemHandlePermissionDescriptor = {};
  if (withWrite) {
    opts.mode = "readwrite";
  }

  // Check if we already have permission, if so, return true.
  if ((await fileHandle.queryPermission(opts)) === "granted") {
    return true;
  }

  // Request permission to the file, if the user grants permission, return true.
  if ((await fileHandle.requestPermission(opts)) === "granted") {
    return true;
  }

  // The user did not grant permission, return false.
  return false;
}

export async function getFolderHanlder() {
  // open file picker
  //   [fileHandle] = await window.showOpenFilePicker();
  folderHanlder = await window.showDirectoryPicker();
  console.log(folderHanlder);

  //   await folderHanlder.queryPermission({ mode: "readwrite" });
  //   await folderHanlder.requestPermission({ mode: "readwrite" });
  const succes = await verifyPermission(folderHanlder, true);
  console.log({ succes });
  return folderHanlder;
}
