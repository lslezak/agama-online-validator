
export async function handleLaunchQueue(setFn) {
  if ("launchQueue" in window) {
    window.launchQueue.setConsumer(async (launchParams) => {
      const file = launchParams.files[0];

      if (file) {
        const blob = await file.getFile();
        const text = await blob.text();
        setFn(text);
      }
    });
  }
}
