import { doubleSha256, OP_HASH160 } from "./Hashes.js";
import { messageDigest } from "./digests/messageDigest.js";
import { messageDigest_p2sh } from "./digests/messageDigest_p2sh.js";
import { messageDigestp2wpkh } from "./digests/messageDigestp2wpkh.js";
import { verifyECDSASignature } from "./ecdsa.js";

//a stack will be passed and the commands will be implemented
function ImpelmentCommands(
  stack,
  commands,
  type = "p2pkh", //default type is p2pkh
  transaction,
  index
) {
  commands.forEach((command) => {
    if (
      command.startsWith("OP_PUSHBYTES_") ||
      command.startsWith("OP_PUSHDATA1") ||
      command.startsWith("OP_0")
    ) {
      // Just Leave them as the next bytes will be auto matically pushed
    } else if (command === "OP_HASH160") {
      let stackElement = stack.pop();
      const hash = OP_HASH160(stackElement);
      stack.push(hash);
    } else if (command === "OP_EQUAL" || command === "OP_EQUALVERIFY") {
      let stackElement1 = stack.pop();
      let stackElement2 = stack.pop();
      stack.push(stackElement1 === stackElement2);
      // Push the result of the equality check
    } else if (command == "OP_DUP") {
      let stackElement = stack.pop();
      stack.push(stackElement);
      stack.push(stackElement);
    } else if (command == "OP_CHECKSIG") {
      const prev_response = stack.pop();
      if (prev_response == true) {
        const publicKey = stack.pop();
        const signature = stack.pop();
        const message = messageDigest(transaction, index);
        const hash = doubleSha256(message);
        const isValid = verifyECDSASignature(publicKey, signature, hash);
        stack.push(isValid);
      }
    } else if (command == "OP_CHECKMULTISIG") {
      let message = "";
      if (type == "p2sh")
        message = doubleSha256(messageDigest_p2sh(transaction, index));
      else if (type == "p2wsh")
        message = doubleSha256(
          messageDigestp2wpkh(transaction, index, "p2wsh")
        );
      const noOfKeys = stack.pop();
      let keys = [];
      for (let i = 0; i < noOfKeys; i++) {
        keys.push(stack.pop());
      }
      const noOfSignatures = stack.pop();
      let signatures = [];
      for (let i = 0; i < noOfSignatures; i++) {
        signatures.push(stack.pop());
      }
      //now we have the keys and signatures
      //check if the signatures are valid with trial of all the public keys
      for (let i = 0; i < noOfSignatures; i++) {
        let isValid = false;
        for (let j = 0; j < noOfKeys; j++) {
          isValid = verifyECDSASignature(keys[j], signatures[i], message);
          if (isValid) break;
        }
        if (!isValid) {
          stack.push(false);
        }
      }
      if (stack.length == 0) stack.push(true);
    } else if (command.startsWith("OP_PUSHNUM")) {
      stack.push(parseInt(command.split("_")[2]));
    } else {
      stack.push(command); // Push other commands directly onto the stack as they should be data elements
    }
  });
  return stack;
}

export { ImpelmentCommands };
