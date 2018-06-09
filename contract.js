class AdTracker {
  constructor() {
    LocalContractStorage.defineProperties(this, {
      owner: null,
      paused: null,  // if paused, cannot retrieve fund
      total: null,
    });
  }

  init() {
    let from = Blockchain.transaction.from;
    this.owner = from;
    this.paused = false;
    this.total = new BigNumber(0);
  }

  /** register click (cpc) */
  registerClick(id) {
    this.register(id, "click");
  }

  /** register view (cpm) */
  registerView(id) {
    this.register(id, "view");
  }

  /** register action.  (action as in cpa) */
  registerAction(id) {
    this.register(id, "action");
  }

  /**
   * called when user click on an ad.  increment counter.
   * @param id id of the ad that is clicked
   * @param type [string] either "click" | "view" | "action" 
   * @return click count
   */
  register(id, type) {
    this.deposit();

    let count = LocalContractStorage.get(this.constructStorageKey(id, type));
    if (!count) {
      Event.Trigger("register " + type, "count for id:" + id + ", type: " + type + " is not found");
      count = new BigNumber(0);
    } else {
      count = new BigNumber(count);
    }

    Event.Trigger("register " + type, "count before: " + count);
    count = count.plus(1);
    Event.Trigger("register " + type, "count after: " + count);
    LocalContractStorage.set(this.constructStorageKey(id, type), count);

    return count;
  }

  /** construct storage keyword */
  constructStorageKey(id, type) {
    return type + "count" + id;
  }

  /** allow deposit fund to this contract */
  deposit() {
    let from = Blockchain.transaction.from;
    let value = Blockchain.transaction.value;
    this.total = value.plus(this.total);
    return this.total;
  }

  /** contract owner can withdraw fund.  if it is not paused right now.  */
  withdraw(value, address) {
    let from = Blockchain.transaction.from;
    let amount = new BigNumber(value);
    const ZERO = new BigNumber(0);
    if (from === this.owner
      && !this.paused
      && amount <= this.total) {
        // if we get this number from localcontractstorage, then we need to cast it again, else we don't have to.
        //this.total = new BigNumber(this.total);

        // for security reason, we sub before transfer
        // this is from bankvaultcontract example, but this does not work.  it will get "<sub>10000000</sub>" instead of number
        //this.total = this.total.sub(amount); 
        this.total = this.total - amount;

        if (this.total >= ZERO) {
          var result = Blockchain.transfer(address, amount);
          if (!result) {
            throw new Error("transfer failed.");
          }
          Event.Trigger("withdraw", {
            Transfer: {
              from: Blockchain.transaction.to,
              to: address,
              value: amount.toString()
            }
          });
        }

        

        return this.total;
    }
  }

  pause() {
    let from = Blockchain.transaction.from;
    if (from === this.owner) {
      this.paused = true;
    }
  }

  unpause() {
    let from = Blockchain.transaction.from;
    if (from === this.owner) {
      this.paused = false;
    }
  }

  getCount(id, type) {
    return LocalContractStorage.get(this.constructStorageKey(id, type));
  }

  getOwner() {
    return this.owner;
  }

  getTotal() {
    return this.total;
  }

  getPaused() {
    return this.paused;
  }

}

module.exports = AdTracker;