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

		// The canvas width height is 400 px
		canvas.width = 800;
		canvas.height = 800;
		canvas.style.height = "30vw";
		canvas.style.width = "30vw";

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

	const roundAndStr = (toRound, precision = 2, toString = true) => {
		toRound /= 1000;
		const pow = Math.pow(10, precision);
		toRound = Math.round(toRound * pow) / pow;
		if (toString) {
			return toRound.toString();
		}
		return toRound;
	};

	// Updates the text on the left and right side of the window
	const updateRound = (() => {
		const left = document.getElementById("left");
		const right = document.getElementById("right");
		const infoBox = document.getElementById("roundInfo");
		const roundDisplay = document.getElementById("round");
		const canvas = document.getElementById("imagePlaceholder");
		const head = document.getElementById("head");

		// For showing results
		const resultsElem = document.getElementById("results");
		const totalTime = document.getElementById("totalTime");
		const avgTime = document.getElementById("avgTime");
		const avgCorrect = document.getElementById("avgCorrect");

		return (round, results) => {
			if (results) {
				canvas.style.display = "none";
				infoBox.style.display = "none";
				head.innerHTML = "Eredmények";
				resultsElem.style.display = "block";
				totalTime.innerHTML = roundAndStr(results.totalTime) + " mp";
				avgTime.innerHTML = roundAndStr(results.avgTime) + " mp";
				avgCorrect.innerHTML =
					(Math.round(results.avgCorrect * 1000) / 10).toString() + "%";
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
			rightRaws: ["nemroma"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Kellemes",
			right: "Kellemetlen",
			leftRaws: ["kellemes"],
			rightRaws: ["kellemetlen"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Cigány<br>Kellemes",
			right: "Fehér<br>Kellemetlen",
			leftRaws: ["roma", "kellemes"],
			rightRaws: ["nemroma", "kellemetlen"],
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
			leftRaws: ["nemroma", "kellemes"],
			rightRaws: ["roma", "kellemetlen"],
			init: async function () {
				this.images = await generateImages(
					this.leftRaws.concat(this.rightRaws)
				);
				this.results = new Array(this.images.length);
			},
		},
		{
			left: "Kellemes<br>Fehér",
			right: "Kellemetlen<br>Cigány",
			leftRaws: ["kellemes", "nemroma"],
			rightRaws: ["kellemetlen", "roma"],
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

	// This returns the answers to the questions at the start of the test
	const getQuestionAnswers = (() => {
		// Checks if input is a valid gender
		const checkGender = (input) => {
			// If the input is null, return 0
			if (!input) {
				return 0;
			}
			switch (input.toLowerCase().trim()) {
				case "férfi":
				case "ferfi":
				case "fiú":
				case "fiu":
				case "f":
					return "Male";
				case "nő":
				case "no":
				case "lány":
				case "lany":
				case "n":
				case "l":
					return "Female";
				default:
					return false;
			}
		};

		// Checks if input is a number between 1 and 10
		const checkNum = (input) => {
			// Returns 0 if the input is null
			if (!input) {
				return 0;
			} else if (isNaN(input.trim())) {
				return false;
			} else {
				num = parseInt(input);
				if (num > 0 && num < 11) {
					return num;
				}
				return false;
			}
		};

		let gender, prejucide;
		do {
			gender = prompt("Mi a nemed? Férfi/Nő");
			returned = checkGender(gender);
			if (returned === 0) {
				// This will run if the user pressed cancel
				returned = false;
				continue;
			} else if (returned === false) {
				// This will run if the user didnt press cancel
				// but typed in an invalid gender
				alert("Csak 'Férfi'-t vagy 'Nő'-t írj be!");
			}
		} while (returned === false);
		gender = returned;

		do {
			num = prompt("Mennyire tartod magad előítéletesnek egytől tízig?");
			returned = checkNum(num);
			if (returned === 0) {
				// This will run if the user pressed cancel
				returned = false;
				continue;
			} else if (returned === false) {
				// This will run if the user didnt press cancel
				// but typed in an invalid number
				alert("Csak egy számot írj be egytől tízig!");
			}
		} while (returned === false);
		// Gender is now the object where we store the inputs
		answers = {
			gender: gender,
			prejucide: returned,
		};

		return () => {
			return answers;
		};
	})();

	const sendResults = async (result) => {
		const url = window.location.href + "results";

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
					const answers = getQuestionAnswers();
					const results = {
						gender: answers.gender,
						prejucide: answers.prejucide,
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
