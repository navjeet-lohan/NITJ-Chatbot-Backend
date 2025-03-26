class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        };

        this.state = false;

        // Preload introductory messages
        this.messages = [
            {
                name: "NITJ",
                message: "Hello! Welcome to the NIT Jalandhar chatbot."
            },
            {
                name: "NITJ",
                message: "Please ask your queries or choose a category: <br>1. Admissions <br>2. Academics <br>3. Extracurricular <br>4. Life at NITJ <br>5. Other"
            }
        ];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => {
            this.toggleState(chatBox);

            if (this.state) {
                this.showIntroMessages(chatBox); // Display intro messages when the chatbot is opened
            }
        });

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;
 
        // Show or hide the chatbox
        if (this.state) {
            chatbox.classList.add('chatbox--active');
            this.showIntroMessages(chatbox);
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    showIntroMessages(chatbox) {
        let chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = ""; // Clear any existing messages
    
        this.messages.forEach((message) => {
            let msgHtml = `<div class="messages__item messages__item--visitor">${message.message}</div>`;
            chatmessage.innerHTML += msgHtml;
        });
    }
    
    

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }
    
        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);
    
        fetch('https://nitj-chatbot-backend.onrender.com/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            if (Array.isArray(r.answer)) {
                r.answer.forEach((response) => {
                    let msg2;
                    if (typeof response === "string") {
                        // Convert \n to <br> for line breaks
                        msg2 = { name: "NITJ", message: response.replace(/\n/g, "<br>") };
                    } else if (response.type === "image") {
                        // Image response case
                        msg2 = {
                            name: "NITJ",
                            message: `<div>${response.text.replace(/\n/g, "<br>")}</div><img src="${response.image_url}" alt="Image" class="chat-image">`
                        };
                    } else if (response.type === "text" && response.url) {
                        // Text with hyperlink response case
                        msg2 = {
                            name: "NITJ",
                            message: `${response.text.replace(/\n/g, "<br>")} <a href="${response.url}" target="_blank" class="chat-link">Click here</a>`
                        };
                    } else {
                        msg2 = { name: "NITJ", message: "I'm sorry, I couldn't process this response." };
                    }
                    this.messages.push(msg2);
                    this.updateChatText(chatbox);
                });
            } else {
                let msg2 = { name: "NITJ", message: (r.answer || "Please visit Official Website of NIT Jalandhar").replace(/\n/g, "<br>") };
                this.messages.push(msg2);
                this.updateChatText(chatbox);
            }
    
            textField.value = "";
        })
        .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = "";
        });
    }
    

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item) {
            if (item.name === "NITJ") {
                html += `<div class="messages__item messages__item--visitor">${item.message}</div>`;
            } else {
                html += `<div class="messages__item messages__item--operator">${item.message}</div>`;
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();
