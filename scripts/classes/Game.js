// Game class to initialize and run the game loop
class Game extends Application {
  constructor(rows, columns) {
    super({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Ensure the canvas fills the entire screen
    this.view.style.cssText = "position: absolute; display: block;";

    this.rows = rows;
    this.columns = columns;

    // Initialize game components
    this.wall = new Wall(rows, columns);
    this.snake = new Snake(rows, columns);
    this.food = new Food();
    this.gameManager = new GameManager(
      rows,
      columns,
      this.wall,
      this.snake,
      this.food
    );
    this.gui = new GUI();
    this.menu = new Menu(
      this.gameManager.gameModes,
      this.gameManager.activeGameMode,
      this.restart.bind(this),
      this.gameManager.toggleGamePause.bind(this.gameManager),
      this.gui.toggleGameFieldContainerVisibility.bind(this.gui)
    );
    this.currentScoreLabel = new ScoreLabel(
      "Current Score",
      {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#ffffff",
      },
      this.snake.coordinates.length - 1
    );
    this.bestScoreLabel = new ScoreLabel(
      "Best Score",
      {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#ffffff",
      },
      this.gameManager.bestScore[this.gameManager.activeGameMode]
    );
    this.menuButton = new Button(
      "Menu",
      100,
      50,
      0xffffff,
      this.menu.toggleMenu.bind(this.menu)
    );

    document.body.appendChild(this.view);
    this.addChildren(this.stage, [this.menu, this.gui]);
    this.addChildren(this.gui.labelsContainer, [
      this.bestScoreLabel,
      this.currentScoreLabel,
      this.menuButton,
    ]);

    this.align();

    // Handle window resize
    window.addEventListener("resize", this.align.bind(this));

    // Variables to help with the timing of game updates
    this.elapsedTime = 0;

    // Start the game loop
    this.ticker.add(this.gameLoop.bind(this));
  }

  align() {
    // Align app stage
    this.renderer.resize(window.innerWidth, window.innerHeight);

    // Align game field and its components
    this.gui.align(this.rows, this.columns, this.wall, this.snake, this.food);
    this.bestScoreLabel.align(this.gui.cellSize * 1.5, this.gui.cellSize * 1.5);
    this.currentScoreLabel.align(
      this.gui.cellSize * 1.5,
      this.gui.cellSize * 2.25
    );
    this.menuButton.align(
      this.gui.width - this.menuButton.width - this.gui.cellSize * 1.5,
      this.gui.cellSize * 1.5
    );

    // Align menu
    this.menu.align(window.innerWidth, window.innerHeight);
  }

  centerGameField(rows, columns) {
    const gameWidth = columns * this.cellSize;
    const gameHeight = rows * this.cellSize;

    const centerX = (window.innerWidth - gameWidth) / 2;
    const centerY = (window.innerHeight - gameHeight) / 2;

    this.x = centerX;
    this.y = centerY;
  }

  addChildren(container, items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      container.addChild(item);
    }
  }

  restart() {
    this.gameManager.reset(
      this.wall,
      this.snake,
      this.food,
      this.currentScoreLabel,
      this.bestScoreLabel,
      this.menu.selectedOption
    );

    this.gui.display(this.wall, this.snake, this.food);

    this.gameManager.setGameOver(false);
  }

  gameLoop() {
    if (!this.gameManager.gameOver && !this.gameManager.gamePause) {
      // Add the time since the last frame to the elapsed time
      this.elapsedTime += this.ticker.elapsedMS;

      // Check if a second has passed; update the game if it has
      if (this.elapsedTime >= this.snake.getSpeed()) {
        this.gameManager.play(
          this.wall,
          this.snake,
          this.food,
          this.currentScoreLabel,
          this.bestScoreLabel,
          this.menu.selectedOption,
          this.menu.toggleMenu.bind(this.menu)
        );

        // Reset the elapsed time while keeping the remainder to stay accurate
        this.elapsedTime %= this.snake.getSpeed();
      }

      this.gui.display(this.wall, this.snake, this.food);
    }
  }

  destroy() {
    this.snake.destroy();
    window.removeEventListener("resize", this.handleWindowResize);
  }
}
