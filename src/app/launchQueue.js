
export async function handleLaunchQueue(setValueFn, setFileNameFn, setFilehandleFn) {
  if ("launchQueue" in window) {
    window.launchQueue.setConsumer(async (launchParams) => {
      const file = launchParams.files[0];

      if (file) {
        const blob = await file.getFile();
        const text = await blob.text();
        setFilehandleFn(file);
        setValueFn(text);
        setFileNameFn(blob.name);
      }
    });
  }
}
