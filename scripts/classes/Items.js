class Item {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.coordinates = [{ row: 0, col: 0 }];
  }

  reset() {
    this.coordinates = [{ row: 0, col: 0 }];
  }

  remove(point) {
    const newCoordinates = [];

    for (let i = 0; i < this.coordinates.length; i++) {
      const coordinate = this.coordinates[i];

      if (coordinate.row !== point.row || coordinate.col !== point.col) {
        newCoordinates.push(coordinate);
      }
    }

    this.coordinates = newCoordinates;
  }

  add(point) {
    this.coordinates.push(point);
  }
}

// Snake class to handle snake behavior
class Snake extends Item {
  constructor() {
    super("SNAKE", "0x000000");

    this.direction = { row: 0, col: 1 };
    // 1000 milliseconds = 1 second
    this.speed = 1000;

    // Bind the 'this' context to the handleKeyDown method
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Add event listener for keydown events
    window.addEventListener("keydown", this.handleKeyDown);
  }

  // Method to update the snake's direction based on key presses
  handleKeyDown(event) {
    event.preventDefault();

    switch (event.key) {
      case "ArrowUp":
        if (this.direction.col !== 1) {
          this.direction = { row: 0, col: -1 };
        }
        break;
      case "ArrowDown":
        if (this.direction.col !== -1) {
          this.direction = { row: 0, col: 1 };
        }
        break;
      case "ArrowRight":
        if (this.direction.row !== -1) {
          this.direction = { row: 1, col: 0 };
        }
        break;
      case "ArrowLeft":
        // Prevent the snake from moving in the opposite direction
        if (this.direction.row !== 1) {
          this.direction = { row: -1, col: 0 };
        }
        break;
    }
  }

  extend() {
    const nextHead = this.getNextHead();

    const arrayLength = this.coordinates.unshift(nextHead);

    return arrayLength;
  }

  crop() {
    const lastElement = this.coordinates.pop();

    return lastElement;
  }

  speedUp() {
    this.speed = this.speed * 0.9;
  }

  getTail() {
    return this.coordinates[this.coordinates.length - 1];
  }

  setHead(point) {
    this.coordinates[0] = point;
  }

  getHead() {
    return this.coordinates[0];
  }

  getNextHead() {
    // Update the snake's head coordinates based on the current direction
    const head = this.coordinates[0];
    const nextHead = {
      row: head.row + this.direction.row,
      col: head.col + this.direction.col,
    };

    return nextHead;
  }

  getSpeed() {
    return this.speed;
  }

  // Call this method to clean up the event listener when the game ends
  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}

// Food class to handle food behavior
class Food extends Item {
  constructor() {
    super("FOOD", "0xff0000");
  }
}

// Food class to handle food behavior
class Wall extends Item {
  constructor(rows, columns) {
    super("WALL", "0xa85c32");

    this.setWalls(rows, columns);
  }

  reset() {
    for (let row = 0; row < this.coordinates.length; row++) {
      for (let col = 0; col < this.coordinates.length[0]; col++) {
        if (row === 0 || row === rows - 1 || col === 0 || col === columns - 1) {
          this.coordinates.push({ row, col });
        }
      }
    }
  }

  setWalls(rows, columns) {
    this.coordinates = new Array();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (row === 0 || row === rows - 1 || col === 0 || col === columns - 1) {
          this.coordinates.push({ row, col });
        }
      }
    }
  }
}