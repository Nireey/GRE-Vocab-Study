document.addEventListener('DOMContentLoaded', function () {
    let currentIndex = 0; // Initialize index for current word
    let words = []; // Array to hold fetched words
    const groupSize = 30; // Number of words per group
    let score = 0; // Initialize score
    let wordStates = {}; // Object to hold the state of each word (up or down)

    function fetchAndDisplayFlashcards() {
        fetch('http://localhost:8000/flashcards.json')
            .then(response => response.json())
            .then(data => {
                words = data.words;
                updateFlashcard(currentIndex); // Initial update with first word
            })
            .catch(error => console.error('Error fetching JSON:', error));
    }

    // Function to update flashcard content
    function updateFlashcard(index) {
        const wordElement = document.getElementById('word');
        const definitionElement = document.getElementById('definition');
        const exampleElement = document.getElementById('example');
        const groupElement = document.getElementById('group');
        const progressElement = document.getElementById('progress');
        const scoreElement = document.getElementById('score');
        const flashcardElement = document.getElementById('flashcard');

        // Determine the group number and word position
        const groupNumber = Math.floor(index / groupSize) + 1;
        const wordPosition = index % groupSize + 1;

        // Display group number, word, definition, example, and progress
        groupElement.textContent = `Group ${groupNumber}`;
        wordElement.textContent = words[index].word;
        definitionElement.textContent = `${words[index].definition}`;
        exampleElement.textContent = `Example: ${words[index].example}`;
        definitionElement.style.display = 'none'; // Hide definition initially
        exampleElement.style.display = 'none'; // Hide example initially
        progressElement.textContent = `${wordPosition}/${groupSize}`;

        // Hide the score until review is finished
        scoreElement.style.display = 'none';

        // Update the flashcard color based on the word state
        if (wordStates[words[index].word] === 'up') {
            flashcardElement.style.backgroundColor = 'lightgreen';
        } else if (wordStates[words[index].word] === 'down') {
            flashcardElement.style.backgroundColor = 'lightcoral';
        } else {
            flashcardElement.style.backgroundColor = 'white';
        }
    }

    // Function to toggle definition and example display
    function toggleDetails() {
        const definitionElement = document.getElementById('definition');
        const exampleElement = document.getElementById('example');
        if (definitionElement.style.display === 'none') {
            definitionElement.style.display = 'block';
            exampleElement.style.display = 'block';
        } else {
            definitionElement.style.display = 'none';
            exampleElement.style.display = 'none';
        }
    }

    // Event listener for key press events
    document.addEventListener('keydown', function (event) {
        if (event.key === ' ' && event.target === document.body) {
            toggleDetails(); // Toggle definition and example display on Space key
        } else if (event.key === 'ArrowRight') {
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex); // Move to the next word
            } else {
                finishReview(); // Finish review if last word is reached
            }
        } else if (event.key === 'ArrowLeft') {
            // Prevent navigating to previous groups from the first group
            if (currentIndex > 0) {
                currentIndex = (currentIndex - 1 + words.length) % words.length;
                updateFlashcard(currentIndex); // Move to the previous word
            }
        } else if (event.key === 'ArrowUp') {
            // Increase score if user knows the word
            score++;
            wordStates[words[currentIndex].word] = 'up'; // Mark word as known
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex); // Move to the next word
            } else {
                finishReview(); // Finish review if last word is reached
            }
        } else if (event.key === 'ArrowDown') {
            wordStates[words[currentIndex].word] = 'down'; // Mark word as not known
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex); // Move to the next word without increasing score
            } else {
                finishReview(); // Finish review if last word is reached
            }
        }
    });

    // Event listener for mouse click on the word element
    document.getElementById('word').addEventListener('click', function () {
        toggleDetails(); // Toggle definition and example display on mouse click
    });

    // Function to finish the review
    function finishReview() {
        const scoreElement = document.getElementById('score');
        scoreElement.style.display = 'block'; // Show the score
        scoreElement.textContent = `Score: ${score}/${words.length}`;
    }

    // Fetch and display flashcards initially
    fetchAndDisplayFlashcards();
});
