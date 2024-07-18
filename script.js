document.addEventListener('DOMContentLoaded', function () {
    let currentIndex = 0;
    let words = [];
    const groupSize = 30;
    let score = 0;
    let wordStates = {};
    let currentTestIndex = 0;
    let currentTestGroup = 0;
    let testWords = [];

    function fetchAndDisplayFlashcards() {
        fetch('http://localhost:8000/flashcards.json')
            .then(response => response.json())
            .then(data => {
                words = data.words;
                populateGroupSelect();
                updateFlashcard(currentIndex);
            })
            .catch(error => console.error('Error fetching JSON:', error));
    }

    function populateGroupSelect() {
        const groupSelect = document.getElementById('group-select');
        const totalGroups = Math.ceil(words.length / groupSize);
        for (let i = 1; i <= totalGroups; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Group ${i}`;
            groupSelect.appendChild(option);
        }
    }

    function updateFlashcard(index) {
        const wordElement = document.getElementById('word');
        const definitionElement = document.getElementById('definition');
        const exampleElement = document.getElementById('example');
        const groupElement = document.getElementById('group');
        const progressElement = document.getElementById('progress');
        const scoreElement = document.getElementById('score');
        const flashcardElement = document.getElementById('flashcard');

        const groupNumber = Math.floor(index / groupSize) + 1;
        const wordPosition = index % groupSize + 1;

        groupElement.textContent = `Group ${groupNumber}`;
        wordElement.textContent = words[index].word;
        definitionElement.textContent = `${words[index].definition}`;
        exampleElement.textContent = `Example: ${words[index].example}`;
        definitionElement.style.display = 'none';
        exampleElement.style.display = 'none';
        progressElement.textContent = `${wordPosition}/${groupSize}`;

        scoreElement.style.display = 'none';

        if (wordStates[words[index].word] === 'up') {
            flashcardElement.style.backgroundColor = 'lightgreen';
        } else if (wordStates[words[index].word] === 'down') {
            flashcardElement.style.backgroundColor = 'lightcoral';
        } else {
            flashcardElement.style.backgroundColor = 'white';
        }
    }

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

    function startTest() {
        currentTestIndex = 0;
        score = 0;
        const groupSelect = document.getElementById('group-select');
        currentTestGroup = parseInt(groupSelect.value);
        testWords = words.slice((currentTestGroup - 1) * groupSize, currentTestGroup * groupSize);
        document.getElementById('test-content').style.display = 'block';
        updateTestWord();
    }

    function updateTestWord() {
        if (currentTestIndex < testWords.length) {
            const testDefinitionElement = document.getElementById('test-definition');
            const userAnswerInput = document.getElementById('user-answer');
            testDefinitionElement.textContent = testWords[currentTestIndex].definition;
            userAnswerInput.value = '';
            document.getElementById('feedback').textContent = '';
            document.getElementById('test-progress').textContent = `Word ${currentTestIndex + 1}/${testWords.length}`;
        } else {
            moveToNextGroup();
        }
    }

    function moveToNextGroup() {
        currentTestGroup++;
        const totalGroups = Math.ceil(words.length / groupSize);
        if (currentTestGroup <= totalGroups) {
            startTest();
        } else {
            finishTest();
        }
    }

    function finishTest() {
        document.getElementById('test-content').style.display = 'none';
        const scoreElement = document.getElementById('score');
        scoreElement.style.display = 'block';
        scoreElement.textContent = `Final Score: ${score}/${testWords.length * currentTestGroup}`;
    }

    function handleAnswerSubmission() {
        const userAnswerInput = document.getElementById('user-answer');
        const feedbackElement = document.getElementById('feedback');
        const correctWord = testWords[currentTestIndex].word;
        if (userAnswerInput.value.trim().toLowerCase() === correctWord.toLowerCase()) {
            score++;
            feedbackElement.textContent = 'Correct!';
            feedbackElement.style.color = 'green';
        } else {
            feedbackElement.textContent = `Incorrect! The correct word is "${correctWord}".`;
            feedbackElement.style.color = 'red';
            setTimeout(() => {
                currentTestIndex++;
                updateTestWord();
            }, 2000);
            return;
        }
        currentTestIndex++;
        updateTestWord();
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === ' ' && event.target === document.body) {
            toggleDetails();
        } else if (event.key === 'ArrowRight') {
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex);
            } else {
                finishReview();
            }
        } else if (event.key === 'ArrowLeft') {
            if (currentIndex > 0) {
                currentIndex = (currentIndex - 1 + words.length) % words.length;
                updateFlashcard(currentIndex);
            }
        } else if (event.key === 'ArrowUp') {
            score++;
            wordStates[words[currentIndex].word] = 'up';
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex);
            } else {
                finishReview();
            }
        } else if (event.key === 'ArrowDown') {
            wordStates[words[currentIndex].word] = 'down';
            currentIndex++;
            if (currentIndex < words.length) {
                updateFlashcard(currentIndex);
            } else {
                finishReview();
            }
        } else if (event.key === 'Q' || event.key === 'E' || event.key === 'q' || event.key === 'e') {
            finishReview();
        }
    });

    document.getElementById('word').addEventListener('click', function () {
        toggleDetails();
    });

    document.getElementById('start-test').addEventListener('click', startTest);
    document.getElementById('submit-answer').addEventListener('click', handleAnswerSubmission);

    function finishReview() {
        const scoreElement = document.getElementById('score');
        scoreElement.style.display = 'block';
        scoreElement.textContent = `Score: ${score}/${words.length}`;
    }

    fetchAndDisplayFlashcards();
});
