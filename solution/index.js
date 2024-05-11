
import fs from "fs";
import { ImpelmentCommands } from "./Helpers/ImplementCommands.js";
import { SHA256, doubleSha256 } from "./Helpers/Hashes.js";
import { serializeTxn } from "./Helpers/digests/serialize.js";
import { messageDigestp2wpkh } from "./Helpers/digests/messageDigestp2wpkh.js";
import { verifyECDSASignature } from "./Helpers/ecdsa.js";
import { mine } from "./mine.js";

readAllFilesGetData("mempool");

function readAllFilesGetData(FolderPath) {
  //read the valid transactions from the file if file not present keep it empty
  const files = fs.readdirSync(FolderPath); // Reading all the files
  let ValidData = [];
  files.forEach((fileName) => {
    const filePath = `${FolderPath}/${fileName}`;
    const fileContent = fs.readFileSync(filePath, "utf8");
    const JsonData = JSON.parse(fileContent);
    const valid = isValidFileName(JsonData, fileName.slice(0, -5));
    if (valid.types != undefined && valid.types.length == 1) {
      valid.fileContent = JsonData;
      valid.types = valid.types[0];
      ValidData.push(valid);
      // valid => { fileName, types } currently types has 1 element
    }
  });

  let Data = [];
  ValidData.forEach((e) => {
    if (verifyTransaction(e.fileContent, e.types)) {
      e.serializetx = serializeTxn(e.fileContent).filename;
      Data.push(e);
    }
  });

  mine(Data);

  return true;
}

function isValidFileName(JsonData, fileName) {
  let serialized = serializeTxn(JsonData);
  let types = Array.from(serialized.types);
  let file = SHA256(
    doubleSha256(serialized.filename).match(/../g).reverse().join("")
  );
  if (file == fileName) {
    return { fileName, types };
  }
  return false;
}

function verifyTransaction(transaction, type) {
  // Assuming 'vin' is an array and we need to check every transaction

  if (type == "v0_p2wpkh") {
    let valid = true;
    transaction.vin.forEach((e, index) => {
      const message = messageDigestp2wpkh(transaction, index);
      const isValid = verifyECDSASignature(e.witness[1], e.witness[0], message);
      if (!isValid) {
        valid = false;
      }
    });

    return valid;
  } else if (type == "p2sh" && transaction.vin[0].witness == undefined) {
    let validTransaction = true;
    transaction.vin.forEach((e, index) => {
      //combine the signature scrpit and pubkey script
      let commands = "";
      commands = e.scriptsig_asm + " " + e.prevout.scriptpubkey_asm;
      commands = commands.split(" ");
      // console.log(commands);
      let stack = [];
      stack = ImpelmentCommands(stack, commands, type, transaction, index);
      if (stack.pop() == false) validTransaction = false;
      commands = e.inner_redeemscript_asm.split(" ");
      stack = ImpelmentCommands(stack, commands, type, transaction, index);
      if (validTransaction && stack[0] == true && stack.length == 1);
      else {
        validTransaction = false;
      }
    });
    return validTransaction;
  } else if (type == "p2pkh") {
    let stack = [];
    let result = true;
    transaction.vin.forEach((e, index) => {
      stack = [];
      let commands = "";
      commands = e.scriptsig_asm + " " + e.prevout.scriptpubkey_asm;
      commands = commands.split(" ");
      stack = ImpelmentCommands(stack, commands, type, transaction, index);
      if (stack[0] == true && stack.length == 1);
      else {
        result = false;
      }
    });
    if (result == false) return false;
    if (stack[0] == true && stack.length == 1) return true;
    return false;
  } else if (type == "v0_p2wsh") {
    let valid = true;
    transaction.vin.forEach((e, index) => {
      const messagehash = messageDigestp2wpkh(transaction, index, "p2wsh");
      const getsignatures = e.inner_witnessscript_asm
        .split(" ")[0]
        .split("_")[2];
      let stack = [];
      for (let i = 0; i < getsignatures; i++) {
        stack.push(e.witness[i + 1]);
      }
      let commands = e.inner_witnessscript_asm.split(" ");
      commands.forEach((command) => {
        if (command.startsWith("OP_PUSHBYTES_") || command == "OP_0") {
          // Just Leave them as the next bytes will be auto matically pushed
        } else if (command === "OP_EQUAL" || command === "OP_EQUALVERIFY") {
          let stackElement1 = stack.pop();
          let stackElement2 = stack.pop();
          stack.push(stackElement1 === stackElement2);
        } else if (command == "OP_DUP") {
          let stackElement = stack.pop();
          stack.push(stackElement);
          stack.push(stackElement);
        } else if (command.startsWith("OP_PUSHNUM")) {
          stack.push(parseInt(command.split("_")[2]));
        } else if (command == "OP_CHECKMULTISIG") {
          let noOfKeys = stack.pop();
          let keys = [];
          for (let i = 0; i < noOfKeys; i++) {
            keys.push(stack.pop());
          }
          let noOfSignatures = stack.pop();
          let signatures = [];
          for (let i = 0; i < noOfSignatures; i++) {
            signatures.push(stack.pop());
          }
          //now we have the keys and signatures
          //check if the signatures are valid with trial of all the public keys
          for (let i = 0; i < noOfSignatures; i++) {
            let isValid = false;
            for (let j = 0; j < noOfKeys; j++) {
              isValid = verifyECDSASignature(
                keys[j],
                signatures[i],
                messagehash
              );
              if (isValid) break;
            }
            if (!isValid) {
              valid = false;
            }
          }
          if (valid == false) return false;
          stack.push(true);
          // console.log(stack);
        } else {
          stack.push(command); // Push other commands directly onto the stack
        }
      });
    });

    return valid;
  } else if (type == "p2sh") {
    if (transaction.vin[0].witness.length == 2) {
      type = "p2wpkh";
      const message = messageDigestp2wpkh(transaction, 0, "p2sh_p2wpkh");
      const signature = transaction.vin[0].witness[0];
      const pubkey = transaction.vin[0].witness[1];
      const valid = verifyECDSASignature(pubkey, signature, message);
      return valid;
    }
    // console.log(transaction.vin[0].witness.length);
  }
  return false;
}

