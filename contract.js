class AdClick {
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

  /**
   * called when user click on an ad.  increment counter.
   * @param id id of the ad that is clicked
   * @return click count
   */
  click(id) {

    let clickCount = LocalContractStorage.get(this.storageKeywordClickCount(id));
    if (!clickCount) {
      Event.Trigger("click", "clickCount for id " + id + " is not found");
      clickCount = new BigNumber(0);
    } else {
      clickCount = new BigNumber(clickCount);
    }

    Event.Trigger("click", "clickCount before: " + clickCount);
    clickCount = clickCount.plus(1);
    Event.Trigger("click", "clickCount after: " + clickCount);
    LocalContractStorage.set(this.storageKeywordClickCount(id), clickCount);

    return clickCount;
  }

  /** construct storage keyword */
  storageKeywordClickCount(id) {
    return "clickcount" + id;
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
    if (from == this.owner
      && !this.paused
      && amount < this.total) {
        this.total = new BigNumber(this.total);
        // for security reason, we sub before transfer
        // this is from bankvaultcontract example, but this does not work.  it will get "<sub>10000000</sub>" instead of number
        //this.total = this.total.sub(amount); 
        this.total = this.total - amount;

        if (this.total > 0) {
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
    if (from == this.owner) {
      this.paused = true;
    }
  }

  unpause() {
    let from = Blockchain.transaction.from;
    if (from == this.owner) {
      this.paused = false;
    }
  }

  getClickCount(id) {
    return LocalContractStorage.get(this.storageKeywordClickCount(id));
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

module.exports = AdClick;
