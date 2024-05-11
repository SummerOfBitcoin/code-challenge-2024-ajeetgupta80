function serializeTxn(transaction) {
  let serialized = "";

  // Serialize version (little-endian) must be 4 bytes
  serialized += transaction.version
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  // Serialize number of inputs must be 1 byte
  serialized += transaction.vin.length.toString(16).padStart(2, "0");
  let set = new Set();
  // Serialize inputs
  transaction.vin.forEach((input, index) => {
    // Serialize txid (little-endian) must be 32 bytes
    serialized += input.txid.match(/../g).reverse().join("");
    set.add(input.prevout.scriptpubkey_type);
    // Serialize vout (little-endian) must be 4 bytes
    serialized += input.vout
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");
    // Serialize scriptSig length
    serialized += (input.scriptsig.length / 2).toString(16).padStart(2, "0");
    // Serialize scriptSig
    serialized += input.scriptsig;
    // Serialize sequence (little-endian)
    serialized += input.sequence
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");
  });

  // Serialize number of outputs
  serialized += transaction.vout.length.toString(16).padStart(2, "0");

  // Serialize outputs
  transaction.vout.forEach((output) => {
    // Serialize value (little-endian)
    const satoshis = output.value; // no need to conver to sathsis as they are already in sathosis

    // Serialize the satoshis value
    serialized += satoshis
      .toString(16)
      .padStart(16, "0")
      .match(/../g)
      .reverse()
      .join("");

    // Serialize scriptPubKey length
    serialized += (output.scriptpubkey.length / 2)
      .toString(16)
      .padStart(2, "0");
    // Serialize scriptPubKey
    serialized += output.scriptpubkey;
  });
  // Serialize locktime
  serialized += transaction.locktime
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  return { filename: serialized, types: set };
}

export { serializeTxn };
// Path: solution/serialize.js
