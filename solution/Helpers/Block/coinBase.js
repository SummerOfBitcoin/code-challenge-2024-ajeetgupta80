import { doubleSha256 } from "../Hashes.js";
import { merkle_root } from "./merkleroot.js";

function coinBase(witnessTxs) {
  let coinBase = "";
  coinBase += "01000000"; // Version -> 4 bytes -> Little Endian
  coinBase += "00"; // Marker ->  1 byte
  coinBase += "01"; // Flag -> 1 byte
  coinBase += "01"; // Number of inputs -> 1 byte
  coinBase +=
    "0000000000000000000000000000000000000000000000000000000000000000"; // Previous Transaction Hash -> 32 bytes -> Little Endian
  coinBase += "ffffffff"; // Previous Txout-index -> 4 bytes -> Little Endian (Max Value)
  coinBase += "25"; // Txin-script length -> 1 byte
  coinBase +=
    "246920616d206e61726173696d686120616e64206920616d20736f6c76696e672062697463";
  // the above is the ascii coding of($i am narasimha and i am solving bitc)
  coinBase += "ffffffff"; // Sequence -> 4 bytes -> Little Endian (Max Value)
  coinBase += "02"; // Number of outputs -> 1 byte
  // First Output
  coinBase += "f595814a00000000"; // Hard coded amount for Blockr reward
  // Amount 1 -> 8 bytes -> Little Endian
  coinBase += "19"; // Txout-script length -> 1 byte
  coinBase += "76a914edf10a7fac6b32e24daa5305c723f3de58db1bc888ac"; // random script pub key
  // Second Output
  coinBase += "0000000000000000"; // Amount 2 -> 8 bytes -> Little Endian
  let script = `6a24aa21a9ed${witnessCommitment(witnessTxs)}`;
  coinBase += (script.length / 2).toString(16); // Txout-script length -> 1 byte
  coinBase += script; // script
  coinBase += "0120"; // stack items , length of the stack item
  coinBase +=
    "0000000000000000000000000000000000000000000000000000000000000000";
  coinBase += "00000000"; // Locktime -> 4 bytes -> Little Endian

  return coinBase;
}

function witnessCommitment(witnessTxs) {
  const merkle = merkle_root(witnessTxs);
  const reserved_value =
    "0000000000000000000000000000000000000000000000000000000000000000";
  return doubleSha256(merkle + reserved_value);
}

export { coinBase };
