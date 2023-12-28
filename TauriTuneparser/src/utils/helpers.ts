export const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      result ? resolve(result as string) : reject();
    };

    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
