// GameManager class to manage game modes and rules
class GameManager {
  constructor(rows, columns, wall, snake, food) {
    // Initialize game manager properties
    this.gameModes = Object.freeze({
      CLASSIC: "Classic",
      NO_DIE: "No Die",
      WALLS: "Walls",
      PORTAL: "Portal",
      SPEED: "Speed",
    });
    this.activeGameMode = this.gameModes.SPEED;

    this.gameOver = false;
    this.gamePause = false;

    this.field = new Array();

    this.resetField(rows, columns);
    this.resetCoordinates(wall, snake, food);
  }

  setActiveGameMode(gameMode) {
    this.activeGameMode = gameMode;
  }

  resetField(rows, columns) {
    for (let row = 0; row < rows; row++) {
      this.field[row] = new Array(columns);

      for (let col = 0; col < columns; col++) {
        this.field[row][col] = "";
      }
    }
  }

  resetCoordinates(wall, snake, food) {
    const items = [wall, snake, food];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.reset();
      const coordinates = item.coordinates;
      const name = item.name;

      for (let j = 0; j < coordinates.length; j++) {
        const point = coordinates[j];
        const cell = this.getCell(point);

        if (cell) {
          const freeCell = this.findFreeCell(snake.getNextHead());

          coordinates[j] = freeCell;
          this.setCell(freeCell, name);
        } else {
          this.setCell(point, name);
        }
      }
    }

    if (
      this.activeGameMode === this.gameModes.PORTAL &&
      food.coordinates.length < 2
    ) {
      food.add(this.findFreeCell(snake.getNextHead()));
    }
  }

  getOppositeFieldSide(point) {
    const rows = this.field.length;
    const columns = this.field[0].length;
    let oppositePoint = { row: 0, col: 0 };

    if (point.row === 0) {
      oppositePoint = { row: rows - 2, col: point.col };
    } else if (point.row === rows - 1) {
      oppositePoint = { row: 1, col: point.col };
    } else if (point.col === 0) {
      oppositePoint = { row: point.row, col: columns - 2 };
    } else if (point.col === columns - 1) {
      oppositePoint = { row: point.row, col: 1 };
    }

    return oppositePoint;
  }

  getWidth() {
    return this.field[0].length;
  }

  getHeight() {
    return this.field.length;
  }

  getCell(point) {
    return this.field[point.row][point.col];
  }

  toggleGamePause() {
    this.gamePause = !this.gamePause;
  }

  setGameOver(gameOver) {
    this.gameOver = gameOver;
  }

  setCell(point, itemName) {
    this.field[point.row][point.col] = itemName;
  }

  removeCell(point) {
    this.field[point.row][point.col] = "";
  }

  setItemCell(item, point) {
    item.add(point);
    this.setCell(point, item.name);
  }

  removeItemCell(item, point) {
    item.remove(point);
    this.removeCell(point);
  }

  findFreeCell(nextHead) {
    // Handle spawning food on the field
    const row = Math.floor(Math.random() * (this.getWidth() - 2)) + 1,
      col = Math.floor(Math.random() * (this.getHeight() - 2)) + 1;
    const cell = this.getCell({ row, col });

    if (cell || (nextHead.row === row && nextHead.col === col)) {
      return this.findFreeCell(nextHead);
    } else {
      return { row, col };
    }
  }

  play(
    wall,
    snake,
    food,
    currentScoreLabel,
    bestScoreLabel,
    selectedGameMode,
    toggleMenu
  ) {
    if (this.activeGameMode !== selectedGameMode) {
      this.setActiveGameMode(selectedGameMode);

      const rows = this.getWidth();
      const columns = this.getHeight();

      wall.reset();
      snake.reset();
      food.reset();
      currentScoreLabel.reset();
      this.resetField(rows, columns);
      this.resetCoordinates(wall, snake, food);
    }

    snake.extend();

    if (
      this.activeGameMode === this.gameModes.NO_DIE &&
      this.getCell(snake.getHead()) === wall.name
    ) {
      const oppositePoint = this.getOppositeFieldSide(snake.getHead());
      snake.setHead(oppositePoint);
    }

    const cellName = this.getCell(snake.getHead());

    if (
      this.activeGameMode !== this.gameModes.NO_DIE &&
      (cellName == snake.name || cellName == wall.name)
    ) {
      bestScoreLabel.setScore(currentScoreLabel.getScore());
      snake.remove(snake.getHead());
      this.setGameOver(true);
      this.setActiveGameMode("");
      toggleMenu();

      return;
    } else if (cellName == food.name) {
      this.removeItemCell(food, snake.getHead());

      if (this.activeGameMode === this.gameModes.WALLS) {
        const firstFreeCell = this.findFreeCell(snake.getNextHead());
        this.setItemCell(wall, firstFreeCell);
      } else if (this.activeGameMode === this.gameModes.PORTAL) {
        const teleportPoint = food.coordinates[0];
        this.removeItemCell(food, food.coordinates[0]);

        const firstFreeCell = this.findFreeCell(snake.getNextHead());
        this.setItemCell(food, firstFreeCell);

        snake.setHead(teleportPoint);
        this.setCell(teleportPoint, snake.name);
      } else if (this.activeGameMode === this.gameModes.SPEED) {
        snake.speedUp();
      }

      const secondFreeCell = this.findFreeCell(snake.getNextHead());
      this.setItemCell(food, secondFreeCell);

      currentScoreLabel.increaseScore();
    } else {
      this.removeCell(snake.getTail());
      snake.crop();
    }

    this.setCell(snake.getHead(), snake.name);
  }
}
