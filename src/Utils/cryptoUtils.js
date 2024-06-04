import CryptoJS from "crypto-js";

const secretKey = "indicosmic";

export const encryptData = (data) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  return encryptedData;
};

export const decryptData = (encryptedData) => {
  try {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const parsedData = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
    return parsedData;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};
