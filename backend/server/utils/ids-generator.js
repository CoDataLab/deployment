function generateUniqueId() {

  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 8;
  
  const array = new Uint8Array(length);

  require('crypto').webcrypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += characters[array[i] % characters.length];
  }

  return result;
}



module.exports = {  generateUniqueId
};