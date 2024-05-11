import fs from "fs";
import { createBlock } from "./Helpers/Block/createBlock.js";
import { merkle_root } from "./Helpers/Block/merkleroot.js";
import { doubleSha256 } from "./Helpers/Hashes.js";
import { serializeTxn } from "./Helpers/digests/serialize.js";
import { coinBase } from "./Helpers/Block/coinBase.js";
import { calculateWeight } from "./Helpers/Block/calculateWeight.js";
import { witness_TxId } from "./Helpers/witnessTxId.js";

function mine(data) {
  let validTransactions = [];
  let txids = [];
  for (const transaction of data) {
    const { fileName, types, fileContent, serializetx } = transaction;

    const serialize = serializeTxn(fileContent);
    const txid = doubleSha256(serialize.filename)
      .match(/../g)
      .reverse()
      .join("");
    const data = fs.readFileSync("mempool/" + fileName + ".json", "utf8");
    const txn = JSON.parse(data);

    validTransactions.push(txn);
    txids.push(txid);
  }

  let max_weight = 4 * 1000 * 1000;
  let current_weight = 320;
  let transactions = [];
  let witnessTxs = [];
  for (let i = 0; i < validTransactions.length; i++) {
    const { complete_weight: tx_wt, tx_type } = calculateWeight(
      validTransactions[i]
    );
    if (tx_type === undefined) continue;
    if (tx_type === "SEGWIT") {
      witnessTxs.push(witness_TxId(validTransactions[i]));
    } else {
      witnessTxs.push(txids[i]);
    }
    if (tx_wt) {
      if (current_weight + tx_wt <= max_weight) {
        transactions.push(txids[i]);
        current_weight += tx_wt;
      } else {
        break;
      }
    }
  }
  // add the witness reserved value in the answer
  witnessTxs.unshift((0).toString(16).padStart(64, "0"));
  let coinbaseTransacton = coinBase(witnessTxs);
  const coinBaseTxId = doubleSha256(coinbaseTransacton)
    .match(/../g)
    .reverse()
    .join("");

  transactions.unshift(coinBaseTxId);
  const merkleRoot = merkle_root(transactions);
  let block = createBlock(merkleRoot, 0); //Intially Nonce is Zero

  //write an output file
  // name: output.txt
  // 1 Line -> Block Header
  // 2 Line -> Coinbase Transaction
  // 3 Line -> No of transaction ids
  let nonce = 0;
  const dificulty = Buffer.from(
    "0000ffff00000000000000000000000000000000000000000000000000000000",
    "hex"
  );
  let blockHash = doubleSha256(block).match(/../g).reverse().join("");
  while (dificulty.compare(Buffer.from(blockHash, "hex")) < 0) {
    nonce++;
    block = createBlock(merkleRoot, nonce);
    blockHash = doubleSha256(block).match(/../g).reverse().join("");
  }

  const AllTransactioinIdsJoined = transactions.join("\n");
  fs.writeFileSync(
    "output.txt",
    block + "\n" + coinbaseTransacton + "\n" + AllTransactioinIdsJoined
  );
}

export { mine };
