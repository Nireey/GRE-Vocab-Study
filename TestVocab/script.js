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

        const currentWord = words[index];

        groupElement.textContent = `Group ${currentWord.group}`;
        definitionElement.textContent = `${currentWord.definition}`;
        correctWordElement.textContent = '';
        exampleElement.textContent = `Example: ${replaceWordWithUnderline(currentWord.example, currentWord.word)}`;
        exampleElement.style.display = 'none';
        progressElement.textContent = `Correct Answers: ${score}/${totalAttempted}`;

        document.getElementById('userInput').value = '';
        flashcardElement.style.backgroundColor = '';
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
        if (event.key
            === 'Enter' && event.target === userInputElement) {
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

        if (userInput === words[currentIndex].word.toLowerCase()) {
            score++;
            totalCorrect++;
            globalTotalCorrect++;
            moveToNextWord(); // Move to next word instantly for correct answer
        } else {
            flashcardElement.style.backgroundColor = 'lightcoral';
            showCorrectWordTimeout = setTimeout(() => {
                showCorrectWordAndMoveToNext(); // Show correct word after timeout if wrong answer
            }, 2000); // Adjust timeout delay as needed
        }

        document.getElementById('userInput').value = '';
    }

    function showCorrectWordAndMoveToNext() {
        const correctWordElement = document.getElementById('correctWord');
        const correctWord = words[currentIndex].word;

        correctWordElement.textContent = `(Correct word: ${correctWord})`;
        correctWordElement.style.display = 'block';

        setTimeout(() => {
            correctWordElement.style.display = 'none';
            moveToNextWord();
        }, 20); // Adjust timeout delay as needed
    }

    function moveToNextWord() {
        currentIndex++;
        if (currentIndex < words.length) {
            updateFlashcard(currentIndex);
        } else {
            finishGroup();
        }
    }

    function finishGroup() {
        const scoreElement = document.getElementById('score');
        globalTotalAttempted += totalAttempted;
        scoreElement.style.display = 'block';
        scoreElement.textContent = `Total Score: ${globalTotalCorrect}/${globalTotalAttempted}`;

        const groupSelect = document.getElementById('groupSelect');
        const nextGroupOption = [...groupSelect.options].find(option => parseInt(option.value) === selectedGroup + 1);
        if (nextGroupOption) {
            groupSelect.value = nextGroupOption.value;
            selectedGroup++;
            words = allWords.filter(word => word.group === selectedGroup);
            startQuiz();
        } else {
            document.getElementById('flashcard').style.display = 'none';
            document.getElementById('score').style.display = 'none';
            document.getElementById('group-selection').style.display = 'block';
            groupSelect.value = '';
            totalCorrect = 0;
            totalAttempted = 0;
            globalTotalCorrect = 0;
            globalTotalAttempted = 0;
        }
    }

    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    fetchAndDisplayFlashcards();
});
