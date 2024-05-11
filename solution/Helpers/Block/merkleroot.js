import { doubleSha256 } from "../Hashes.js";

function merkle_root(txids) {
  let hashes = txids.map((txid) =>
    Buffer.from(txid.match(/../g).reverse().join(""), "hex")
  );

  while (hashes.length > 1) {
    let newHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      let left = hashes[i];
      let right = "";
      if (i + 1 === hashes.length) {
        right = left;
      } else {
        right = hashes[i + 1];
      }
      let hash = doubleSha256(Buffer.concat([left, right]));
      newHashes.push(Buffer.from(hash, "hex"));
    }
    hashes = newHashes;
  }

  return hashes[0].toString("hex");
};


export { merkle_root };
