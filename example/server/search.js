const searchForm = document.querySelector('#search-form');
const searchFormInput = document.querySelector('input');


var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(SpeechRecognition) {
    console.log('Your browser support');

    searchForm.insertAdjacentHTML('beforeend', '<button type="button"><i class="fas fa-microphone"></i></button>');
    const micBtn = searchForm.querySelector('button');
    const micIcon = micBtn.querySelector('i');

    const recognition = new SpeechRecognition();
    // recognition.continuous = true;

    micBtn.addEventListener('click',micBtnClick);





    function micBtnClick() {
        if(micIcon.classList.contains('fa-microphone')){
            recognition.start();

        }else {

            recognition.stop();
        }
    }
    recognition.addEventListener('start', startSpeechRecognition);

    function startSpeechRecognition() {
        micIcon.classList.remove('fa-microphone');
        micIcon.classList.add('fa-microphone-slash');
        searchFormInput.focus();
        console.log("speech reacognition active");
    }
    recognition.addEventListener('end', endSpeechRecognition);

    function endSpeechRecognition() {
        micIcon.classList.remove('fa-microphone-slash');
        micIcon.classList.add('fa-microphone');
        searchFormInput.focus();
        console.log("speech reacognition desactiver");
    }

    recognition.addEventListener('result', resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {

        const transcript = event.results[0][0].transcript;
        searchFormInput.value = transcript;
        setTimeout(() => {
            searchForm.submit();
        }, 750);
    }
}

else {
    console.log("your browser does not");
}


