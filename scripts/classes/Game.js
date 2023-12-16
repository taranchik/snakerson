// Game class to initialize and run the game loop
class Game {
  constructor(rows, columns) {
    this.app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Ensure the canvas fills the entire screen
    this.app.view.style.cssText = "position: absolute; display: block;";

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
      this.gameManager.setGameOver.bind(this.gameManager),
      this.gameManager.toggleGamePause.bind(this.gameManager),
      this.gui.toggleGameFieldContainerVisibility.bind(this.gui)
    );
    this.bestScoreLabel = new ScoreLabel(
      "Best Score",
      {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "#ffffff",
      },
      localStorage.getItem("bestScore")
    );
    this.currentScoreLabel = new ScoreLabel("Current Score", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff",
    });
    this.menuButton = new Button(
      "Menu",
      100,
      50,
      0xffffff,
      this.menu.toggleMenu.bind(this.menu)
    );

    document.body.appendChild(this.app.view);
    this.addChildren(this.app.stage, [this.menu, this.gui.gameFieldContainer]);
    this.addChildren(this.gui.gameFieldContainer, [
      this.gui.fieldContainer,
      this.gui.labelsContainer,
    ]);
    this.addChildren(this.gui.labelsContainer, [
      this.bestScoreLabel,
      this.currentScoreLabel,
      this.menuButton,
    ]);

    this.handleResize = function () {
      this.resize(rows, columns);
    };

    this.handleResize();

    // Handle window resize
    window.addEventListener("resize", this.handleResize);

    // Variables to help with the timing of game updates
    this.elapsedTime = 0;

    // Start the game loop
    this.app.ticker.add((delta) => this.gameLoop(delta));
  }

  resize(rows, columns) {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.gui.resize(this.app.stage, rows, columns);
    this.bestScoreLabel.resize(
      this.gui.cellSize * 1.5,
      this.gui.cellSize * 1.5
    );
    this.currentScoreLabel.resize(
      this.gui.cellSize * 1.5,
      this.gui.cellSize * 2.25
    );
    this.menuButton.resize(
      this.gui.gameFieldContainer.width -
        this.menuButton.width -
        this.gui.cellSize * 1.5,
      this.gui.cellSize * 1.5
    );
  }

  addChildren(container, items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      container.addChild(item);
    }
  }

  gameLoop(delta) {
    if (!this.gameManager.gameOver && !this.gameManager.gamePause) {
      // Add the time since the last frame to the elapsed time
      this.elapsedTime += this.app.ticker.elapsedMS;

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
    }

    this.gui.render(this.wall, this.snake, this.food);
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}
