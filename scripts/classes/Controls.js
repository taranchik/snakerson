class Menu extends PIXI.Container {
  constructor(
    options,
    selectedOption,
    setGameOver,
    toggleGamePause,
    toggleGameFieldContainerVisibility
  ) {
    super();

    this.setGameOver = setGameOver;
    this.selectedOption = new String(selectedOption);
    this.toggleGamePause = toggleGamePause;
    this.toggleGameFieldContainerVisibility =
      toggleGameFieldContainerVisibility;
    this.visible = false;

    // Title label at the top
    this.titleLabel = new Label("Choose game mode", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: "#ffffff",
    });
    this.addChild(this.titleLabel);

    // Arrange radio buttons in a column
    for (const key in options) {
      const radioButton = new RadioButton(
        options[key],
        this.handleSelect.bind(this, options[key])
      );
      radioButton.setSelected(options[key] === selectedOption);

      this.addChild(radioButton);
    }

    // Play button below radio buttons
    this.playButton = new Button(
      "Play",
      100,
      50,
      0xffffff,
      this.handlePlay.bind(this)
    );
    // Exit button below play button
    this.exitButton = new Button(
      "Exit",
      100,
      50,
      0xffffff,
      this.toggleMenu.bind(this)
    );

    this.addChild(this.playButton);
    this.addChild(this.exitButton);

    // this.menuContainer.addChild(radioButton.content.element);

    // radioButton.element.anchor.set(0.5);
    // radioButton.x = window.innerWidth / 2;
    // radioButton.y = window.innerHeight / 2;
    // Create a Graphics object for the background
    // this.background = new PIXI.Graphics();
    // this.background.beginFill(0x000000, 0.95); // Semi-transparent black
    // this.background.drawRect(0, 0, containerWidth, containerHeight); // Full screen size
    // this.background.endFill();

    // Add the background to the menu
    // this.menuContainer.addChild(this.background);
    this.toggleMenu();

    this.resize(window.innerWidth, window.innerHeight);
  }

  setSelectedOption(option) {
    this.selectedOption = option;
  }

  getSelectedOption() {
    let selectedOption = "";

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child instanceof RadioButton) {
        if (child.innerSquare.visible) {
          selectedOption = child.label.text;
        }
      }
    }

    return selectedOption;
  }

  handlePlay() {
    this.setGameOver(false);
    this.setSelectedOption(this.getSelectedOption());
    this.toggleMenu();
  }

  handleSelect(option) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child instanceof RadioButton) {
        child.setSelected(child.label.text === option);
      }
    }
  }

  toggleMenu() {
    this.toggleGamePause();
    this.toggleGameFieldContainerVisibility();
    this.toggleMenuContainerVisibility();
  }

  toggleMenuContainerVisibility() {
    this.visible = !this.visible;
  }

  resize(x, y) {
    this.titleLabel.y = 10;
    this.titleLabel.x = (x - this.titleLabel.width) / 2; // Center horizontally

    let currentY = this.titleLabel.height + 80;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child instanceof RadioButton) {
        child.y = currentY;
        child.x = (x - child.width) / 2; // Center horizontally
        currentY += child.height + 20;
      }
    }

    const buttonsY = currentY;
    // Calculate the combined width of both buttons and the space between them
    const buttonsMargin = 40;
    const combinedButtonsWidth =
      this.playButton.width + this.exitButton.width + buttonsMargin;

    // Calculate the starting x position for the first button to center the row
    const startingX = (x - combinedButtonsWidth * 2) / 2;

    // Position the play button
    this.playButton.y = buttonsY;
    this.playButton.x = startingX;

    // Position the exit button right next to the play button
    this.exitButton.y = buttonsY;
    this.exitButton.x =
      this.playButton.x + this.playButton.width + buttonsMargin;
  }
}

class Button extends PIXI.Container {
  constructor(labelText, width, height, backgroundColor, onClick) {
    super();

    // Create the button graphics
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(backgroundColor, 0.25); // Button color
    this.graphics.drawRect(0, 0, width, height); // Rounded rectangle
    this.graphics.endFill();
    this.addChild(this.graphics);

    // Create the button label
    this.label = new Label(labelText, {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff",
    });
    this.addChild(this.label);

    // Make the button interactive
    this.interactive = true;
    this.buttonMode = true;

    // Event listener for the button
    this.on("pointerdown", onClick);

    this.resize(width, height);
  }

  resize(x, y) {
    this.graphics.x = x;
    this.graphics.y = y;
    this.label.x = x + (this.graphics.width - this.label.width) / 2;
    this.label.y = y + (this.graphics.height - this.label.height) / 2;
  }
}

class RadioButton extends Button {
  constructor(labelText, onClick) {
    super(labelText, 0, 0, "", onClick);

    this.square = new PIXI.Graphics();
    this.square.beginFill(0xffffff); // Black fill, you can choose your own color
    this.square.drawRect(0, 0, 20, 20); // x, y, width, height for the element
    this.square.endFill();
    this.addChild(this.square);

    this.innerSquare = new PIXI.Graphics();
    this.innerSquare.beginFill(0x000000); // Black fill, you can choose your own color
    this.innerSquare.drawRect(
      0,
      0,
      this.square.width / 2,
      this.square.height / 2
    ); // x, y, width, height for the element
    this.innerSquare.endFill();
    this.innerSquare.visible = false;
    this.addChild(this.innerSquare);

    const squareCenterX = this.square.x + this.square.width / 2;
    const squareCenterY = this.square.y + this.square.height / 2;

    // Set the position of the inner graphics
    this.innerSquare.x = squareCenterX - this.innerSquare.width / 2;
    this.innerSquare.y = squareCenterY - this.innerSquare.height / 2;

    // Set the position of the inner graphics
    this.label.x = squareCenterX - this.label.width / 2;
    this.label.y = squareCenterY - this.label.height / 2;

    this.label.x = 50;
  }

  setSelected(isSelected) {
    this.innerSquare.visible = isSelected;
  }

  resize() {}
}

class Label extends PIXI.Text {
  constructor(text, style) {
    super(text, style);
  }

  resize(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ScoreLabel extends Label {
  constructor(text, style) {
    super(text, style);
    this.content = text;
    this.score = 0;

    this.setText();
  }

  setText() {
    this.text = `${this.content}: ${this.score}`;
  }

  increaseScore() {
    this.score = this.score + 1;
    this.setText();
  }

  setScore(score) {
    if (score > this.score) {
      this.score = score;
      this.setText();
    }
  }

  getScore() {
    return this.score;
  }

  reset() {
    this.score = 0;
    this.setText();
  }
}
