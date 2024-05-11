import crypto from "crypto";

function doubleSha256(hexInput) {
  // Convert the hex input to a Buffer
  const buffer = Buffer.from(hexInput, "hex");

  // Perform the first SHA-256 hash
  const firstHash = crypto.createHash("sha256").update(buffer).digest();

  // Perform the second SHA-256 hash and convert the result to a hex string
  const secondHash = crypto
    .createHash("sha256")
    .update(firstHash)
    .digest("hex");

  return secondHash;
}

function SHA256(data) {
  // Convert the data to a Buffer
  const buffer = Buffer.from(data, "hex");
  const sha256 = crypto.createHash("sha256");
  return sha256.update(buffer).digest("hex");
}

function OP_HASH160(publicKey) {
  const sha256Hash = crypto.createHash("sha256");
  sha256Hash.update(Buffer.from(publicKey, "hex"));
  const sha256 = sha256Hash.digest();

  const ripemd160Hash = crypto.createHash("ripemd160");
  ripemd160Hash.update(sha256);
  const ripemd160 = ripemd160Hash.digest();

  return ripemd160.toString("hex");
}

export { doubleSha256, SHA256, OP_HASH160 };
// Path: solution/Hashes.js
