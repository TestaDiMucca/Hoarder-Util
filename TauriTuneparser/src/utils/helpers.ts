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

export const sortByKey = <T extends object>(array: T[], key: keyof T) => {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
};
