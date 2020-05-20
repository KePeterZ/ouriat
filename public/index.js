// Only start when window is loaded
window.addEventListener("load", async () => {
	// Loads an image, returns a promise
	const loadImage = (src) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener("load", () => resolve(img));
			img.addEventListener("error", (err) => reject(err));
			img.src = src;
		});
	};

	// Loads all the images of the given type
	const loadImageType = async (type) => {
		let images = new Array(6);
		for (var i = 0; i < 6; i++) {
			images[i] = loadImage(`./images/${type}/${i + 1}.png`);
		}
		return await Promise.all(images);
	};

	// This shuffles the array given times
	const shuffle = (array, times) => {
		for (let i = 0; i < times; i++) {
			for (let j = 0; j < array.length; j++) {
				let k = Math.floor(Math.random() * (j + 1));
				[array[j], array[k]] = [array[k], array[j]];
			}
		}
		return array;
	};

	const generateImages = async (typesToLoad) => {
		// Get all the images of all the types
		let imageArray = new Array(typesToLoad.length);
		for (let i = 0; i < typesToLoad.length; i++) {
			imageArray[i] = await loadImageType(typesToLoad[i]);
		}

		// Make every element into an object that has the type of
		// the image so later it can be identified
		let imageObjects = new Array(typesToLoad.length * 6);
		for (let i = 0; i < imageArray.length; i++) {
			for (let j = 0; j < 6; j++) {
				let object = {};
				object.type = typesToLoad[i];
				object.src = imageArray[i][j];
				imageObjects[i * 6 + j] = object;
			}
		}
		return shuffle(imageObjects, 3); // Return the shuffled array
	};

	// Clears the canvas and draws the image
	const displayImage = (() => {
		// Setting up canvas
		const canvas = document.getElementById("imagePlaceholder");
		const ctx = canvas.getContext("2d");
		canvas.height = 400;
		canvas.width = 400;

		return (imageSrc) => {
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(
				imageSrc,
				0,
				0,
				imageSrc.width,
				imageSrc.height,
				0,
				0,
				canvas.width,
				canvas.height
			);
		};
	})();

	// Updates the text on the left and right side of the window
	const updateRound = (() => {
		const left = document.getElementById("left");
		const right = document.getElementById("right");
		const infoBox = document.getElementById("roundInfo");
		const roundDisplay = document.getElementById("round");
		const canvas = document.getElementById("imagePlaceholder");
		const head = document.getElementById("head");

		return (round, showResults) => {
			if (showResults) {
				canvas.style.display = "none";
				infoBox.style.display = "none";
				head.innerHTML = "Eredmények";
			} else if (round) {
				left.innerHTML = round.left;
				right.innerHTML = round.right;
				canvas.style.display = "none";
				roundDisplay.innerHTML = `${rounds.indexOf(round) + 1}. Kör`;
				infoBox.style.display = "block";
			} else {
				infoBox.style.display = "none";
				canvas.style.display = "block";
			}
		};
	})();

	const rounds = [
		{
			left: "Cigány",
			right: "Fehér",
			leftRaws: ["roma"],
			rightRaws: ["feher"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Bogár",
			right: "Cuki",
			leftRaws: ["bogar"],
			rightRaws: ["cuki"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Cigány<br>Cuki",
			right: "Fehér<br>Bogár",
			leftRaws: ["roma", "cuki"],
			rightRaws: ["feher", "bogar"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Fehér",
			right: "Fekete",
			leftRaws: ["roma"],
			rightRaws: ["feher"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Cuki<br>Fehér",
			right: "Cigány<br>Bogár",
			leftRaws: ["cuki", "feher"],
			rightRaws: ["roma", "bogar"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
	];

	// Initialize the results of each round
	for (round of rounds) {
		await round.init();
	}

	const sendResults = async (result) => {
		const url = window.location.href + "uploadResults";

		const h = new Headers();
		h.append("Content-Type", "application/json");

		const req = new Request(url, {
			method: "POST",
			headers: h,
			body: JSON.stringify(result),
		});

		fetch(req)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				console.log("Something went wrong");
			})
			.then((data) => {
				console.log(data.status);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// Evaluates the results
	const evaluate = (resTime, keyCode, roundIndex, imageIndex) => {
		const round = rounds[roundIndex];
		const image = round.images[imageIndex];
		let correct;
		if (keyCode === 37) {
			// Left arrow
			correct = round.leftRaws.includes(image.type);
		} else {
			// Right arrow
			correct = round.rightRaws.includes(image.type);
		}
		round.results[imageIndex] = {
			resTime: resTime,
			correct: correct,
		};
	};

	// Displays next image or next round
	const keyPressed = (() => {
		let roundIndex = 0;
		// Have to subtract 1 because 0 is the text
		let imageIndex = 0;
		let currendRound = rounds[roundIndex];
		let startTime;
		let resultsSent = false;
		updateRound(currendRound);

		return (keyCode) => {
			// Only register if test is not over
			if (roundIndex < 5) {
				if (imageIndex === 0) {
					// If the first image, then hide the text and display image
					updateRound();
					imageIndex++;

					// Displaying the next image and starting timer
					displayImage(currendRound.images[imageIndex - 1].src);
					startTime = window.performance.now();
				} else {
					// If not the first image
					if (keyCode) {
						// Save results
						evaluate(
							window.performance.now() - startTime,
							keyCode,
							roundIndex,
							imageIndex - 1
						);

						// Prepare to show next image
						imageIndex++;
						// Check if there is next image of round is over
						if (imageIndex === currendRound.images.length + 1) {
							// If round is over, show the text and hide canvas
							roundIndex++;
							imageIndex = 0;
							currendRound = rounds[roundIndex];
							updateRound(currendRound);
						} else {
							// If round is note over, display the image and start timer
							displayImage(currendRound.images[imageIndex - 1].src);
							startTime = window.performance.now();
						}
					}
				}
			} else {
				// Send results to server
				if (!resultsSent) {
					resultsSent = true;
					let totalTime = (count = correctCount = 0);

					rounds.forEach((round) => {
						round.results.forEach((result) => {
							totalTime += result.resTime;
							count++;
							if (result.correct) {
								correctCount++;
							}
						});
					});

					const avgTime = totalTime / count;
					const avgCorrect = correctCount / count;

					const results = {
						totalTime: totalTime,
						avgTime: avgTime,
						avgCorrect: avgCorrect,
					};

					sendResults(results);
					// Show results
					updateRound(undefined, results);
				}
			}
		};
	})();

	window.addEventListener("keydown", (event) => {
		// Safety stuff
		if (event.isComposing || event.keyCode === 229) {
			return;
		}
		// Only register if key is left or right arrow
		if (event.keyCode === 37 || event.keyCode === 39) {
			keyPressed(event.keyCode);
			return;
		}
		keyPressed();
	});
});
