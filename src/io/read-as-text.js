export default file => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = (event) => resolve(event.target.result);

  reader.onerror = () => {
    reader.abort();
    reject(reader.error);
  };

  reader.readAsText(file);
});
