// the Launch Handler API is experimental and not defined in the Typescript DOM library,
// see https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API
interface LaunchParams {
  readonly files: readonly FileSystemFileHandle[];
}

interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

declare global {
  interface Window {
    launchQueue?: LaunchQueue;
  }
}

export type FileLaunchHandler = (handle: FileSystemFileHandle, name: string, content: string) => void;

/**
 * Handle opening a file in the installed web application (e.g. via "Open with" in the file manager)
 * @param onFileLaunch callback called with the opened file
 */
export function handleLaunchQueue(onFileLaunch: FileLaunchHandler): void {
  window.launchQueue?.setConsumer(async (launchParams) => {
    const handle = launchParams.files[0];
    if (!handle) return;

    const file = await handle.getFile();
    onFileLaunch(handle, file.name, await file.text());
  });
}
