import { doubleSha256 } from "./Hashes.js";

function witness_TxId(transaction) {
  let serialized = "";
  let witness = [];
  let stack_items = 0;
  let stack_items_witness = "";
  // Serialize version (little-endian) must be 4 bytes
  serialized += transaction.version
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  serialized += "0001"; // marker + Flag

  // Serialize number of inputs must be 1 byte
  serialized += transaction.vin.length.toString(16).padStart(2, "0");
  // Serialize inputs
  transaction.vin.forEach((input) => {
    stack_items = 0; // setting up the stack items
    stack_items_witness = ""; // setting up the stack items witness

    // Serialize txid (little-endian) must be 32 bytes
    serialized += input.txid.match(/../g).reverse().join("");

    //setting up the witness field
    stack_items = input.witness.length.toString(16).padStart(2, "0");
    // Serialize signature length
    input.witness.forEach((witness) => {
      stack_items_witness += (witness.length / 2).toString(16).padStart(2, "0");
      stack_items_witness += witness;
    });

    witness.push(stack_items + stack_items_witness);

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

    // Serialize sequence (little-endian) - must be 4 bytes
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
    // Assuming 'output.value' is in Bitcoins, convert it to satoshis
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

  serialized += witness.join(""); // stack items

  serialized += transaction.locktime
    .toString(16)
    .padStart(8, "0")
    .match(/../g)
    .reverse()
    .join("");

  const txid = doubleSha256(serialized).match(/../g).reverse().join("");

  return txid;
}


export { witness_TxId };
// Path: solution/serialize.js
