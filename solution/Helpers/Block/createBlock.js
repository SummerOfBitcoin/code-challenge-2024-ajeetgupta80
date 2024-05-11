function createBlock(merkle_root, nonce) {
  /* 
    Block header -> 80 bytes -> 320 weight units
  */
  let block = "";
  block += "11100000"; // Version -> 4 bytes -> Little Endian
  block += "0000000000000000000000000000000000000000000000000000000000000000"; // Previous Block Hash -> 32 bytes -> Natural byte order
  block += merkle_root; // Merkle Root -> 32 bytes -> Natural Byte Order
  const Time = Math.floor(Date.now() / 1000);
  block += Time.toString(16).padStart(8, "0").match(/../g).reverse().join(""); // Time -> 4 bytes -> Little Endian
  block += "ffff001f"; // Bits -> 4 bytes -> Little Endian -> this is Current Target
  block += nonce.toString(16).padStart(8, "0"); // Nonce -> 4 bytes -> Little Endian
  return block;
}

export { createBlock };
