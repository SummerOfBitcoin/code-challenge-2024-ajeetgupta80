import pkg from "elliptic";
const { ec: EC } = pkg;

function parseDER(serialized) {
  // Extract R
  const rLength = parseInt(serialized.substring(6, 8), 16) * 2;
  const rStart = 8;
  const rEnd = rStart + rLength;
  const r = serialized.substring(rStart, rEnd);

  // Extract S
  const sLength = parseInt(serialized.substring(rEnd + 2, rEnd + 4), 16) * 2;
  const sStart = rEnd + 4;
  const sEnd = sStart + sLength;
  const s = serialized.substring(sStart, sEnd);

  return { r, s };
}

function verifyECDSASignature(publicKeyHex, signatureHex, messageHex) {
  const ecdsa = new EC("secp256k1");
  const key = ecdsa.keyFromPublic(publicKeyHex, "hex");
  const signature = parseDER(signatureHex);
  const isValid = key.verify(messageHex, signature);
  return isValid;
}

export { verifyECDSASignature };
