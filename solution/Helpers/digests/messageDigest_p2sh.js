function messageDigest_p2sh(transaction, inputIndex) {
  let messageDigest_p2sh = "";

  // Serialize version (little-endian) must be 4 bytes
  messageDigest_p2sh += transaction.version
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  // Serialize number of inputs must be 1 byte
  messageDigest_p2sh += transaction.vin.length.toString(16).padStart(2, "0");

  // Serialize inputs
  transaction.vin.forEach((input, index) => {
    // Serialize txid (little-endian) must be 32 bytes
    messageDigest_p2sh += input.txid.match(/../g).reverse().join("");

    // Serialize vout (little-endian) must be 4 bytes
    messageDigest_p2sh += input.vout
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");

    // Serialize scriptSig length
    if (index === inputIndex) {
      // Serialize scriptSig

      let scriptsig_asm = input.scriptsig_asm || "SCRIPT SIG ASM: MISSING";
      let scriptsig_asm_slices = scriptsig_asm.split(" ");
      let redeem_script = "";
      if (scriptsig_asm_slices.length != 0) {
        redeem_script = scriptsig_asm_slices[scriptsig_asm_slices.length - 1];
      }
      messageDigest_p2sh += (redeem_script.length / 2)
        .toString(16)
        .padStart(2, "0");
      messageDigest_p2sh += redeem_script;
    } else {
      messageDigest_p2sh += "00"; // Empty scriptSig
    }
    // Serialize sequence (little-endian) must be 4 bytes
    messageDigest_p2sh += input.sequence
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");
  });

  // Serialize number of outputs
  messageDigest_p2sh += transaction.vout.length.toString(16).padStart(2, "0");

  // Serialize outputs
  transaction.vout.forEach((output) => {
    // Serialize value (little-endian)
    // Assuming 'output.value' is in Bitcoins, convert it to satoshis
    const satoshis = output.value; // no need to conver to sathsis as they are already in sathosis

    // Serialize the satoshis value
    messageDigest_p2sh += satoshis
      .toString(16)
      .padStart(16, "0")
      .match(/../g)
      .reverse()
      .join("");

    // Serialize scriptPubKey length
    messageDigest_p2sh += (output.scriptpubkey.length / 2)
      .toString(16)
      .padStart(2, "0");
    // Serialize scriptPubKey
    messageDigest_p2sh += output.scriptpubkey;
  });
  // Serialize locktime
  messageDigest_p2sh += transaction.locktime
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  return messageDigest_p2sh + "01000000"; // This is the SIGHASH_ALL flag
}

export { messageDigest_p2sh };
// Path: solution/Helpers/messageDigest_p2sh.js
