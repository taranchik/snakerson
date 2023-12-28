// GameManager class to manage game modes and rules
class GameManager extends Storage {
  constructor(rows, columns, wall, snake, food) {
    super("GameManager");

    // Initialize game manager properties
    if (this.localStorageData === null) {
      this.gameModes = Object.freeze({
        CLASSIC: "Classic",
        NO_DIE: "No Die",
        WALLS: "Walls",
        PORTAL: "Portal",
        SPEED: "Speed",
      });

      this.field = new Array();
      this.activeGameMode = this.gameModes.CLASSIC;
      this.bestScore = { [this.gameModes.CLASSIC]: 0 };
      this.gameOver = false;

      this.resetField(rows, columns);
      this.resetCoordinates(wall, snake, food);
    }

    this.gamePause = true;
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
      const { name, coordinates } = items[i];

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
      const freeCell = this.findFreeCell(snake.getNextHead());
      this.setItemCell(food, freeCell);
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

  setActiveGameMode(gameMode) {
    this.activeGameMode = gameMode;
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

  reset(
    wall,
    snake,
    food,
    currentScoreLabel,
    bestScoreLabel,
    selectedGameMode
  ) {
    const rows = this.getWidth();
    const columns = this.getHeight();
    const items = [wall, snake, food];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.reset();
    }

    this.setActiveGameMode(selectedGameMode);
    currentScoreLabel.reset();
    bestScoreLabel.setScore(this.bestScore[this.activeGameMode] || 0);
    this.resetField(rows, columns);
    this.resetCoordinates(wall, snake, food);
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
    snake.move();

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
      if (bestScoreLabel.getScore() < currentScoreLabel.getScore()) {
        this.bestScore[this.activeGameMode] = currentScoreLabel.getScore();
        bestScoreLabel.setScore(this.bestScore[this.activeGameMode]);
      }
      snake.remove(snake.getHead());
      this.setGameOver(true);
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
