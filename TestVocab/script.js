document.addEventListener('DOMContentLoaded', function () {
    let currentIndex = 0;
    let allWords = [];
    let words = [];
    let score = 0;
    let selectedGroup = null;
    let showCorrectWordTimeout = null;
    let totalCorrect = 0;
    let totalAttempted = 0;
    let globalTotalCorrect = 0;
    let globalTotalAttempted = 0;
    let answeredIndices = new Set(); // Track answered indices
    let incorrectWords = new Set(); // Use Set to store incorrect words

    function fetchAndDisplayFlashcards() {
        fetch('http://localhost:8000/flashcards.json')
            .then(response => response.json())
            .then(data => {
                allWords = data.words;
                populateGroupOptions(data.words);
            })
            .catch(error => console.error('Error fetching JSON:', error));
    }

    function populateGroupOptions(words) {
        const groupSelect = document.getElementById('groupSelect');
        const groups = [...new Set(words.map(word => word.group))];

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = `Group ${group}`;
            groupSelect.appendChild(option);
        });
    }

    function startQuiz() {
        const groupSelect = document.getElementById('groupSelect');
        selectedGroup = parseInt(groupSelect.value);
        words = allWords.filter(word => word.group === selectedGroup);
        words = shuffle(words);
        currentIndex = 0;
        score = 0;
        totalAttempted = words.length;
        answeredIndices.clear(); // Reset answered indices for new quiz
        incorrectWords.clear(); // Reset incorrect words for new quiz
        document.getElementById('group-selection').style.display = 'none';
        document.getElementById('flashcard').style.display = 'block';
        document.getElementById('userInput').style.display = 'block';
        updateFlashcard(currentIndex);
    }

    function updateFlashcard(index) {
        const definitionElement = document.getElementById('definition');
        const exampleElement = document.getElementById('example');
        const groupElement = document.getElementById('group');
        const progressElement = document.getElementById('progress');
        const correctWordElement = document.getElementById('correctWord');
        const flashcardElement = document.getElementById('flashcard');
        const userInputElement = document.getElementById('userInput');

        const currentWord = words[index];

        groupElement.textContent = `Group ${currentWord.group}`;
        definitionElement.textContent = `${currentWord.definition}`;
        correctWordElement.textContent = '';
        exampleElement.textContent = `Example: ${replaceWordWithUnderline(currentWord.example, currentWord.word)}`;
        exampleElement.style.display = 'none';
        progressElement.textContent = `Correct Answers: ${score}/${totalAttempted}`;

        userInputElement.value = '';
        flashcardElement.style.backgroundColor = '';

        // Disable input for answered words
        if (answeredIndices.has(index)) {
            userInputElement.disabled = true;
        } else {
            userInputElement.disabled = false;
        }
    }

    function replaceWordWithUnderline(sentence, word) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return sentence.replace(regex, match => '_'.repeat(match.length));
    }

    function shuffle(array) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    document.addEventListener('keydown', function (event) {
        const userInputElement = document.getElementById('userInput');
        const exampleElement = document.getElementById('example');
        if (event.key === 'Enter' && !userInputElement.disabled) {
            checkAnswer();
        } else if (event.key === ' ' && event.target !== userInputElement) {
            if (exampleElement.style.display === 'none') {
                exampleElement.style.display = 'block';
            } else if (showCorrectWordTimeout) {
                clearTimeout(showCorrectWordTimeout);
                showCorrectWordTimeout = null;
                moveToNextWord(); // Move to next word if space key is pressed after showing correct word
            }
        }
    });

    function checkAnswer() {
        const userInput = document.getElementById('userInput').value.trim().toLowerCase();
        const flashcardElement = document.getElementById('flashcard');
        const currentWord = words[currentIndex];

        if (userInput === currentWord.word.toLowerCase()) {
            score++;
            totalCorrect++;
            globalTotalCorrect++;
            answeredIndices.add(currentIndex); // Mark current index as answered
            incorrectWords.delete(currentWord); // Ensure correct word is not in incorrect list
            moveToNextWord(); // Move to next word instantly for correct answer
        } else {
            flashcardElement.style.backgroundColor = 'lightcoral';
            incorrectWords.add(currentWord); // Add incorrect word to the Set
            showCorrectWordTimeout = setTimeout(() => {
                showCorrectWordAndMoveToNext(); // Show correct word after timeout if wrong answer
            }, 2000); // Adjust timeout delay as needed
        }
    }

    function showCorrectWordAndMoveToNext() {
        const correctWordElement = document.getElementById('correctWord');
        const correctWord = words[currentIndex].word;

        correctWordElement.textContent = `(Correct word: ${correctWord})`;
        correctWordElement.style.display = 'block';

        setTimeout(() => {
            correctWordElement.style.display = 'none';
            moveToNextWord();
        }, 2000); // Adjust timeout delay as needed
    }

    function moveToNextWord() {
        currentIndex++;
        document.getElementById('userInput').value = ''; // Clear input box before moving to next word
        if (currentIndex < words.length) {
            updateFlashcard(currentIndex);
        } else {
            finishGroup();
        }
    }

    function finishGroup() {
        const scoreElement = document.getElementById('score');
        const incorrectWordsContainer = document.getElementById('incorrectWordsContainer');
        const finishButtons = document.getElementById('finishButtons');
        const incorrectWordsList = document.getElementById('incorrectWords');

        globalTotalAttempted += totalAttempted;

        scoreElement.innerHTML = `
            <p>Total Score: ${globalTotalCorrect}/${globalTotalAttempted}</p>
        `;

        incorrectWordsContainer.style.display = 'block';
        incorrectWordsList.innerHTML = '';

        incorrectWords.forEach(word => {
            const listItem = document.createElement('li');
            listItem.textContent = word.word;
            incorrectWordsList.appendChild(listItem);
        });

        document.getElementById('flashcard').style.display = 'none';
        document.getElementById('scoreContainer').style.display = 'block';
        finishButtons.style.display = 'block';
    }

    document.getElementById('nextGroup').addEventListener('click', function () {
        selectedGroup++;

        // Check if the next group exists
        const maxGroup = Math.max(...allWords.map(word => word.group));
        if (selectedGroup <= maxGroup) {
            const groupSelect = document.getElementById('groupSelect');
            groupSelect.value = selectedGroup;
            startQuiz();
        } else {
            alert('No more groups available.');
            resetQuiz();
        }
    });

    document.getElementById('quitQuiz').addEventListener('click', function () {
        resetQuiz();
    });

    function resetQuiz() {
        document.getElementById('scoreContainer').style.display = 'none';
        document.getElementById('group-selection').style.display = 'block';
        document.getElementById('groupSelect').value = '';
        totalCorrect = 0;
        totalAttempted = 0;
        globalTotalCorrect = 0;
        globalTotalAttempted = 0;
        answeredIndices.clear();
    }

    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    fetchAndDisplayFlashcards();
});
