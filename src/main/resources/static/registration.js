

async function addUser() {

    const usernameError = document.getElementById('usernameError');
    const surnameError = document.getElementById('surnameError');
    const passwordError = document.getElementById('passwordError');


    const newUsername = document.getElementById('username').value;
    const newSurname = document.getElementById('surname').value;
    const newPassword = document.getElementById('password').value;

    const newUser = {
        username: newUsername,
        surname: newSurname,
        password: newPassword,
    };
    console.log('New user created: ' + newUser.username)

    try {
        const response = await fetch(`/api/registration/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) {
            const data = await response.json();
            console.log(data.messageList);
            const list = data.messageList;

            for(let i = 0; i < list.length; i++ ) {
                if (list[i].includes("Username")) {
                    usernameError.textContent += list[i] + ";\n";
                }
                if (list[i].includes("Surname")) {
                    surnameError.textContent += list[i] + ";\n";
                }
                if (list[i].includes("Password")) {
                    passwordError.textContent += list[i] + ";\n";
                }
            }
            throw new Error('Failed to create user');
        }

        usernameError.textContent = '';
        surnameError.textContent = '';
        passwordError.textContent = '';


        const addedUser = await response.json();
        console.log('Created user added to DB. User: ', addedUser);

        console.log('New User REGISTRATED')
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

const regSub = document.getElementById('registrationSub');
regSub.addEventListener('click', (event) => {
    event.preventDefault()

    try {
        addUser();
        window.location.href = '/login';
    } catch (error) {

    }
})