class AdClick {
  constructor() {
  }

  init() {
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

  getClickCount(id) {
    return LocalContractStorage.get(this.storageKeywordClickCount(id));
  }

}

module.exports = AdClick;
