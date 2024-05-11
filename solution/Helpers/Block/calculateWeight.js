function calculateWeight(tx) {
  //here i will calculate the weight of the trasnsaction

  //check if the transaction is segwit or not
  let tx_type = "SEGWIT";

  //determining the type of the transaction
  if (tx.vin.some((e) => e.witness === undefined)) {
    tx_type = "LEGACY";
  }

  let tx_weight = 0;
  let segwit_wt = 0;

  // irrespective of the type of transaction, the it can be legacy
  //version -> in bytes
  tx_weight += 4;

  if (tx.vin.length >= 50) {
    //input count -> in bytes
    return false;
  }
  //input count -> in bytes
  tx_weight += 1;

  //input -> in bytes
  tx.vin.forEach((e) => {
    tx_weight += 32; //txid -> in bytes
    tx_weight += 4; //vout -> in bytes
    tx_weight += 1; //scriptSig length -> in bytes
    tx_weight += e.scriptsig.length / 2; //scriptSig -> in bytes
    tx_weight += 4; //sequence -> in bytes
  });

  if (tx.vout.length >= 50) {
    //output count -> in bytes
    return false;
  }

  //output count -> in bytes
  tx_weight += 1;

  //output -> in bytes
  tx.vout.forEach((e) => {
    tx_weight += 8; //value -> in bytes
    tx_weight += 1; //scriptPubKey length -> in bytes
    tx_weight += e.scriptpubkey.length / 2; //scriptPubKey -> in bytes
  });

  //locktime -> in bytes
  tx_weight += 4;

  if (tx_type === "SEGWIT") {
    //witness -> in bytes
    segwit_wt += 2;
    segwit_wt += tx.vin.length; //number of stack items -> in bytes
    tx.vin.forEach((e) => {
      e.witness.forEach((w) => {
        segwit_wt += 1 + w.length / 2; //witness -> in bytes
      });
    });
  }

  const complete_weight = tx_weight * 4 + segwit_wt;
  return { complete_weight, tx_type };
}

function calculateFees(transaction) {
  let input_sum = BigInt(0);
  let output_sum = BigInt(0);

  transaction.vin.forEach((input) => {
    input_sum += input.value;
  });

  transaction.vout.forEach((output) => {
    output_sum += output.value;
  });

  return input_sum - output_sum;
}

export { calculateWeight, calculateFees };
