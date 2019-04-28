class Stack {

    constructor() {
        this._items = [];
        this._top = -1;
    }

    push(item) {
      this._top++;
      this._items[this._items.length] = item;
    }

    pop() {
      if (!this.isEmpty()) {
        let item = this._items[this._top]
        this._items.splice(this._items.length-1,1);
        this._top--;
        return item;
      }
    }

    peek() {
      return (this._items[this._top])
    }

    isEmpty() {
      return (this._top == -1)
    }
}

module.exports = Stack;