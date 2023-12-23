// GUI class to handle the game's user interface
class GUI {
  constructor() {
    // Initialize GUI components
    this.gameFieldContainer = new PIXI.Container();
    this.fieldContainer = new PIXI.Container();
    this.labelsContainer = new PIXI.Container();

    this.cellSize = 0;
  }

  align(rows, columns) {
    // You might also want to adjust other game elements here
    this.cellSize = Math.min(
      window.innerWidth / rows,
      window.innerHeight / columns
    );

    //
    this.setBackground();
    //
    this.centerGameField(rows, columns);
    //
    this.setGameFieldBackground(rows, columns);
    // Remove all items from the field
    this.fieldContainer.removeChildren();
  }

  drawRect(graphic, color, x, y, width, height) {
    graphic.beginFill(color);
    graphic.drawRect(x, y, width, height);
    graphic.endFill();
  }

  setGameFieldBackground(rows, columns) {
    let backgroundContainer = undefined;

    if (
      this.gameFieldContainer.children.length &&
      this.gameFieldContainer.getChildAt(0).name === "background"
    ) {
      backgroundContainer = this.gameFieldContainer.getChildAt(0);
      backgroundContainer.removeChildren();
    } else {
      backgroundContainer = new PIXI.Container();
      backgroundContainer.name = "background";
      this.gameFieldContainer.addChildAt(backgroundContainer, 0);
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = new PIXI.Graphics();
        const color = this.getDefaultColor(row, col);

        this.drawRect(
          cell,
          color,
          col * this.cellSize,
          row * this.cellSize,
          this.cellSize,
          this.cellSize
        );

        backgroundContainer.addChild(cell);
      }
    }
  }

  setBackground() {
    const parentContainer = this.gameFieldContainer.parent;
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw a gradient on the canvas
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "brown"); // Start color
    gradient.addColorStop(1, "green"); // End color
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a Pixi texture from the canvas
    const texture = PIXI.Texture.from(canvas);

    let background = undefined;

    if (
      parentContainer.children.length &&
      parentContainer.getChildAt(0).name === "background"
    ) {
      background = parentContainer.getChildAt(0);
    } else {
      // Create a Pixi sprite using the texture
      background = new PIXI.Sprite();
      background.name = "background";
      // Add the sprite to app.parentContainer
      parentContainer.addChildAt(background, 0);
    }

    background.texture = texture;
  }

  centerGameField(rows, columns) {
    const gameWidth = columns * this.cellSize;
    const gameHeight = rows * this.cellSize;

    const centerX = (window.innerWidth - gameWidth) / 2;
    const centerY = (window.innerHeight - gameHeight) / 2;

    this.gameFieldContainer.x = centerX;
    this.gameFieldContainer.y = centerY;
  }

  filterChildren() {
    const children = this.fieldContainer.children;
    const existingChildren = new Map();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      const cellProps = this.getCellProps(child.name);

      existingChildren.set(
        this.getCellKey(cellProps.row, cellProps.col),
        child
      );
    }

    return existingChildren;
  }

  getDefaultColor(row, col) {
    let color = 0xa2d04a;

    if ((row + col) % 2 === 0) {
      color = 0xa2d04a;
    } else {
      color = 0xa9d751;
    }

    return color;
  }

  getCellName(name, row, col) {
    return `${name}_${row}_${col}`;
  }

  getCellKey(row, col) {
    return `${row}:${col}`;
  }

  getCellProps(name) {
    const splittedName = name.split("_");

    return {
      name: splittedName[0],
      row: splittedName[1],
      col: splittedName[2],
    };
  }

  toggleGameFieldContainerVisibility() {
    this.gameFieldContainer.visible = !this.gameFieldContainer.visible;
  }

  // Call this method when the food position is updated
  render(wall, snake, food) {
    const existingGraphics = this.filterChildren();
    const items = [wall, snake, food];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      for (let j = 0; j < item.coordinates.length; j++) {
        const point = item.coordinates[j];
        const name = this.getCellName(item.name, point.row, point.col);
        const key = this.getCellKey(point.row, point.col);
        let graphic = existingGraphics.get(key);

        if (!graphic) {
          graphic = new PIXI.Graphics();
          this.fieldContainer.addChild(graphic);
        }

        if (name !== graphic.name) {
          graphic.clear();
          this.drawRect(
            graphic,
            item.color,
            point.row * this.cellSize,
            point.col * this.cellSize,
            this.cellSize,
            this.cellSize
          );

          graphic.name = name;
        }

        // Remove the graphic from the map to not remove it later
        existingGraphics.delete(key);
      }
    }

    for (const [key, graphic] of existingGraphics) {
      this.fieldContainer.removeChild(graphic);
    }
  }
}
