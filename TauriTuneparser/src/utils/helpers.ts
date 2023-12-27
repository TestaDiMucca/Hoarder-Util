export const readFile = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      result ? resolve(result) : reject();
    };

    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
