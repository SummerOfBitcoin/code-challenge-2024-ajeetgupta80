import { doubleSha256 } from "../Hashes.js";

function messageDigestp2wpkh(transaction, inputIndex, type = "p2wpkh") {
  // Serialize version (little-endian) must be 4 bytes
  if (transaction.vin.length <= inputIndex) return "";

  const version = transaction.version
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  let prevouts = "";
  let sequences = "";
  transaction.vin.forEach((input) => {
    prevouts += input.txid.match(/../g).reverse().join("");
    prevouts += input.vout
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");
    sequences += input.sequence
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");
  });

  const hashPrevouts = doubleSha256(prevouts);
  const SequenceHash = doubleSha256(sequences);

  let serialized = version + hashPrevouts + SequenceHash;
  serialized +=
    transaction.vin[inputIndex].txid.match(/../g).reverse().join("") +
    transaction.vin[inputIndex].vout
      .toString(16)
      .padStart(8, "0")
      .match(/../g)
      .reverse()
      .join("");

  if (type === "p2wpkh") {
    serialized +=
      "1976a914" +
      transaction.vin[inputIndex].prevout.scriptpubkey.slice(4) +
      "88ac"; //script code for p2wpkh
  } else if (type == "p2sh_p2wpkh") {
    serialized +=
      "1976a914" +
      transaction.vin[inputIndex].inner_redeemscript_asm.split(" ")[2] +
      "88ac"; //script code for p2sh_p2wpkh
  } else if (type == "p2wsh") {
    let length = transaction.vin[inputIndex].witness.length;
    serialized += (transaction.vin[inputIndex].witness[length - 1].length / 2)
      .toString(16)
      .padStart(2, "0");
    serialized += transaction.vin[inputIndex].witness[length - 1];
  }

  //seriaserized the input amount
  serialized += transaction.vin[inputIndex].prevout.value
    .toString(16)
    .padStart(16, "0")
    .match(/../g)
    .reverse()
    .join("");

  //serialized the sequence
  serialized += transaction.vin[inputIndex].sequence
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  //serialize all the hashoutputs
  let outputs = "";

  transaction.vout.forEach((output) => {
    outputs += output.value
      .toString(16)
      .padStart(16, "0")
      .match(/../g)
      .reverse()
      .join("");
    outputs += (output.scriptpubkey.length / 2).toString(16).padStart(2, "0");
    outputs += output.scriptpubkey;
  });
  let hashOutputs = doubleSha256(outputs);
  serialized += hashOutputs;
  serialized += transaction.locktime
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  serialized += "01000000";
  return doubleSha256(serialized);
}

export { messageDigestp2wpkh };
