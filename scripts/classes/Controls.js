class Menu extends PIXI.Container {
  constructor(
    options,
    selectedOption,
    restartGame,
    toggleGamePause,
    toggleGameFieldContainerVisibility
  ) {
    super();

    this.restartGame = restartGame;
    this.toggleGamePause = toggleGamePause;
    this.toggleGameFieldContainerVisibility =
      toggleGameFieldContainerVisibility;

    // Title label at the top
    this.titleLabel = new Label("Choose game mode", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: "#ffffff",
    });
    this.addChild(this.titleLabel);

    this.radioButtons = {};
    this.initialySelectedOption = selectedOption;
    this.selectedOption = selectedOption;

    // Arrange radio buttons in a column
    for (const key in options) {
      const radioButton = new RadioButton(
        options[key],
        this.handleSelect.bind(this, options[key])
      );

      radioButton.setSelected(options[key] === selectedOption);
      this.radioButtons[options[key]] = radioButton;
      this.addChild(radioButton);
    }

    // Play button below radio buttons
    this.playButton = new Button(
      "Play",
      100,
      50,
      0xffffff,
      this.onPressPlay.bind(this)
    );
    // Exit button below play button
    this.exitButton = new Button(
      "Exit",
      100,
      50,
      0xffffff,
      this.onPressExit.bind(this)
    );

    this.addChild(this.playButton);
    this.addChild(this.exitButton);

    this.background = new PIXI.Graphics();
    this.addChildAt(this.background, 0);

    // Add event listener for keydown events
    window.addEventListener("keydown", this.handleEscapePress.bind(this));
  }

  handleEscapePress(event) {
    if (event.key === "Escape") {
      this.toggleMenu();
    }
  }

  handleSelect(option) {
    this.radioButtons[this.selectedOption].setSelected(false);
    this.radioButtons[option].setSelected(true);
    this.selectedOption = option;
  }

  onPressExit() {
    this.handleSelect(this.initialySelectedOption);
    this.toggleMenu();
  }

  onPressPlay() {
    this.restartGame();
    this.toggleMenu();
  }

  toggleMenu() {
    if (!this.visible) {
      this.initialySelectedOption = this.selectedOption;
    }

    this.toggleGamePause();
    this.toggleGameFieldContainerVisibility();
    this.toggleMenuContainerVisibility();
  }

  toggleMenuContainerVisibility() {
    this.visible = !this.visible;
  }

  // Align menu background
  alignBackground() {
    this.background.clear();
    this.background.beginFill(0x008f5b, 0.7);
    this.background.drawRect(0, -25, 339, 480); // x, y, width, height
    this.background.endFill();
  }

  alignContent() {
    // Control current Y position
    let currentY = this.titleLabel.height + 60;

    // Center titleLabel horizontally
    this.titleLabel.x = (this.width - this.titleLabel.width) / 2;
    // currentX to control RadioButtons vertical position
    let currentX = 0;

    // Center RadioButtons
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child instanceof RadioButton) {
        if (!currentX) {
          currentX = (this.width - child.width) / 2;
        }

        // Set y position
        child.y = currentY;
        // Set x coordinate the same as first RadioButton
        child.x = currentX;
        // Update currentY position
        currentY += child.height + 20;
      }
    }

    // Buttons horizontal offset
    const horizontalButtonsOffset = 40;
    // Sum width of both buttons and the offset between them
    const combinedButtonsWidth =
      this.playButton.width + horizontalButtonsOffset + this.exitButton.width;
    // Set playButton y position
    this.playButton.y = currentY;
    // playButton is start point of both Buttons
    // Parent container width substract full width of both buttons and then divided by 2
    // Finally, substract playButton width, because playButton and exitButton are positioned sequentially
    // and x-position of the playButton needs to be shifted back by its own width.
    this.playButton.x =
      (this.width - combinedButtonsWidth) / 2 - this.playButton.width;

    // Set exitButton y position
    this.exitButton.y = currentY;
    // Calculate and set x for exitButton
    this.exitButton.x =
      this.playButton.x + this.playButton.width + horizontalButtonsOffset;
  }

  centerContainer(outerWidth, outerHeight) {
    // Center container horizontally
    this.x = (outerWidth - this.width) / 2;
    // Center container vertically
    this.y = (outerHeight - this.height) / 2;
  }

  align(outerWidth, outerHeight) {
    this.alignBackground();
    this.alignContent();
    this.centerContainer(outerWidth, outerHeight);
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

    this.align(width, height);
  }

  align(x, y) {
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
}

class Label extends PIXI.Text {
  constructor(text, style) {
    super(text, style);
  }

  align(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ScoreLabel extends Label {
  constructor(text, style, score) {
    super(text, style);
    this.content = text;

    this.setScore(score);

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
    if (score) {
      this.score = score;
    } else {
      this.score = 0;
    }

    this.setText();
  }

  getScore() {
    return this.score;
  }

  reset() {
    this.score = 0;
    this.setText();
  }
}
