
showAdminPage();

function showAdminPage() {
    fetch('/api/admin/users')
        .then(response => response.json())
        .then(users => {
            // Полученные данные (users) предполагается, что это массив объектов пользователей
            const tableBody = document.querySelector('#userTable tbody');
            const container = document.getElementById('usersNavigation');

            users.forEach(user => {
                // заполнение таблицы инфой о всех пользователей
                const row = tableBody.insertRow();
                row.id = `userRow-${user.id}`;
                row.insertCell(0).textContent = user.username;
                row.insertCell(1).textContent = user.surname;
                row.insertCell(2).textContent = user.id;

                const roles = user.roles.map(roleObject => roleObject.role).join(', ');
                row.insertCell(3).textContent = roles;
                row.insertCell(4).textContent = 'Some additional info';

                // Добавление кнопок, ссылающих на странички юзеров
                const link = linkToUserInfo(user)
                container.appendChild(link);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function linkToUserInfo(user) {
    // Добавление кнопок, ссылающих на странички юзеров
    console.log('запустился метод linkToUserInfo');
    const link = document.createElement('a');
    link.id = `userLink-${user.id}`;
    link.classList.add('btn', 'btn-primary', 'btn-block', 'mt-2');
    link.textContent = user.username + ' ' + user.surname;

    link.addEventListener('click', () => {
        fetch(`/api/user/${user.id}`)
            .then(response => response.json())
            .then(async userInfo => {
                // Отражение инфы об отдельном пользователе
                await showUserInfoTable(userInfo)
            })
    })
    return link;
}

//===========================================================================
// тут использовать данные аутентифицированного пользователя.
// TODO
fetch('/api/admin/users/authenticatedUser')
    .then(response => response.json())
    .then(user => {
        const navbarElement = document.getElementById('navbarBrand');
        navbarElement.textContent = user.username + ' ' + user.surname;
    })
    .catch(error => console.error('Error fetching users:', error));


//===========================================================================
// Просмотр информации о пользователе


function fillEditForm(user) {
    const idForEditedUser = document.getElementById('editId');
    const editedUsername = document.getElementById('editUsername');
    const editedSurname = document.getElementById('editSurname');
    const editedPassword = document.getElementById('passwordEdit');

    idForEditedUser.value = user.id;
    editedUsername.value = user.username;
    editedSurname.value = user.surname;
    editedPassword.value = user.password;
}

function fillDeleteForm(user) {
    const idForEditedUser = document.getElementById('deleteId');
    const editedUsername = document.getElementById('deleteUsername');
    const editedSurname = document.getElementById('deleteSurname');
    const editedPassword = document.getElementById('passwordDelete');

    idForEditedUser.value = user.id;
    console.log('Logging for UserID to be deleted. Id is: ' + user.id);
    editedUsername.value = user.username;
    editedSurname.value = user.surname;
    editedPassword.value = user.password;

    console.log('fillDeleteUserForm срабатывает для Юзера с ID : ' + user.id);
}

function saveChanges() {
    const idForEditedUser = document.getElementById('editId').value;
    const editedUsername = document.getElementById('editUsername').value;
    const editedSurname = document.getElementById('editSurname').value;
    const editedPassword = document.getElementById('passwordEdit').value;

    const editedUser = {
        id: idForEditedUser,
        username: editedUsername,
        surname: editedSurname,
        password: editedPassword
    }

    fetch(`/api/user/${editedUser.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
    })
        .then(response => response.json())
        .then(updatedUser => {
            console.log('User updated: ', updatedUser);

            $('#EditUserForm').modal('hide');
            updateUserTable(editedUser.id)
        })
}

async function addUser() {
    const usernameError = document.getElementById('usernameError');
    const surnameError = document.getElementById('surnameError');
    const passwordError = document.getElementById('passwordError');

    const newUsername = document.getElementById('newUsername').value;
    const newSurname = document.getElementById('newSurname').value;
    const newPassword = document.getElementById('newPassword').value;

    const selectedRoles = Array.from(document.getElementById('newRole').selectedOptions).map(option => {
        return {
            id: parseInt(option.value),
            role: option.textContent
        };
    });

    const newUser = {
        username: newUsername,
        surname: newSurname,
        password: newPassword,
        roles: selectedRoles
    };
    console.log('New user created: ' + newUser.username)

    try {
        const response = await fetch(`/api/admin/create`, {
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
        const tableBody = document.querySelector('#userTable tbody');

        const row = tableBody.insertRow()
        row.id = `userRow-${addedUser.id}`;
        row.insertCell(0).textContent = addedUser.username;
        row.insertCell(1).textContent = addedUser.surname;
        row.insertCell(2).textContent = addedUser.id;

        const roles = addedUser.roles.map(roleObject => roleObject.role).join(', ');
        row.insertCell(3).textContent = roles;
        row.insertCell(4).textContent = 'Some additional info';

        console.log('Обновили таблицу, добавили новую строку для пользователя ' + addedUser);

        const container = document.getElementById('usersNavigation');

        const link = linkToUserInfo(addedUser);

        container.appendChild(link);

        showUserList()

        console.log('New User ADDED')
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

// Срабатывает при нажатии кнопки для подтверждения удаления
async function deleteUser(user) {
    const idForDeleteUser = document.getElementById('deleteId').value;
    const deleteUsername = document.getElementById('deleteUsername').value;
    const deleteSurname = document.getElementById('deleteSurname').value;
    const deletePassword = document.getElementById('passwordDelete').value;

    const deleteUser = {
        id: idForDeleteUser,
        username: deleteUsername,
        surname: deleteSurname,
        password: deletePassword
    }

    try {
        const response = await fetch(`/api/user/${deleteUser.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        const link = document.getElementById(`userLink-${idForDeleteUser}`);
        const tableRow = document.getElementById(`userRow-${idForDeleteUser}`);

        if (link && tableRow) {
            link.remove();
            console.log('Link removed');
            tableRow.remove();
            console.log('Row removed');
        } else {
            console.log('Link or row not found');
        }

    } catch (error) {
        console.error('Error deleting user:', error);
    }

    $('#DeleteUserForm').modal('hide');
    showUserList();
}

function updateUserTable(id) {
    const userInfoTable = document.getElementById('userInfoTable');
    const tbody = userInfoTable.querySelector('tbody');

    fetch(`/api/user/${id}`)
        .then(response => response.json())
        .then(user => {
            const row = `<tr>
                                <td>${user.username}</td>
                                <td>${user.surname}</td>
                                <td>${user.id}</td>
                                <td>${user.roles.map(roleObject => roleObject.role).join(', ')}</td>
                                <td><button type="button" class="btn btn-info editBtn" data-toggle="modal" data-target="#EditUserForm">Edit</td>
                                <td><button type="button" class="btn btn-danger deleteBtn" data-toggle="modal" data-target="#DeleteUserForm">Delete</td>
                            </tr>`;

            tbody.innerHTML = '';
            tbody.innerHTML += row;

            updateUserLink(user.id, user.username, user.surname);

            userInfoTable.style.display = 'table';
            document.getElementById('userTable').style.display = 'none';
            document.getElementById('createUserForm').style.display = 'none';
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function updateUserLink(id, username, surname) {
    const link = document.getElementById(`userLink-${id}`);
    const tableRow = document.getElementById(`userRow-${id}`);

    link.textContent = username + ' ' + surname;

    tableRow.cells[0].textContent = username;
    tableRow.cells[1].textContent = surname;
}

function showUserInfoTable(user) {
    console.log('showUserInfoTable метод поюзеру: ' + user.id + ' ' +user.username);
    const userInfoTable = document.getElementById('userInfoTable');
    const tbody = userInfoTable.querySelector('tbody');

    // Очищаем таблицу перед добавлением новой информации
    tbody.innerHTML = '';

    // Добавляем информацию о пользователе в таблицу
    const row = `<tr>
                    <td>${user.username}</td>
                    <td>${user.surname}</td>
                    <td>${user.id}</td>
                    <td>${user.roles.map(roleObject => roleObject.role).join(', ')}</td>
                    <td><button type="button" class="btn btn-info editBtn" data-toggle="modal" data-target="#EditUserForm">Edit</td>
                    <td><button type="button" class="btn btn-danger deleteBtn" data-toggle="modal" data-target="#DeleteUserForm">Delete</td>
                </tr>`;
    tbody.innerHTML += row;

    // Отображаем таблицу
    userInfoTable.style.display = 'table';
    document.getElementById('userTable').style.display = 'none';
    document.getElementById('createUserForm').style.display = 'none';

    const editButton = tbody.querySelector('.editBtn');
    const editSub = document.getElementById('editSub');

    editButton.addEventListener('click', () => {
        // Показываем модальное окно Edit и заполняем форму
        document.getElementById('EditUserForm').style.display = 'block';
        fillEditForm(user);
        fillDeleteForm(user);
        console.log('Edit button clicked for user ID:', user.id);
    });

    editSub.addEventListener('click', () => {
        saveChanges();
    })

    const deleteButton = tbody.querySelector('.deleteBtn');
    const deleteSub = document.getElementById('deleteSub');

    deleteButton.addEventListener('click', () => {
        document.getElementById('DeleteUserForm').style.display = 'block';
        fillEditForm(user);
        fillDeleteForm(user);
        console.log('Delete button for user by ID', user.id);
    })

    deleteSub.addEventListener('click', deleteSubClickHandler);
}

async function deleteSubClickHandler() {
    await deleteUser();
    console.log('Deletion submit of user');
}

//===========================================================================
// Добавление нового пользователя

function showCreateUserForm() {
    // Показываем форму создания нового пользователя
    document.getElementById('createUserForm').style.display = 'block';
    // Скрываем таблицу с пользователями (или другие элементы, которые вы хотите скрыть)
    document.getElementById('userTable').style.display = 'none';

    document.getElementById('userInfoTable').style.display = 'none';

    const newUsername = document.getElementById('newUsername');
    const newSurname = document.getElementById('newSurname');
    const newPassword = document.getElementById('newPassword');

    newUsername.value = '';
    newSurname.value = '';
    newPassword.value = '';
}

const newSubBtn = document.getElementById('newSub');

newSubBtn.addEventListener('click', (event) => {
    // чтобы не переходили автоматически на начальную страницу
    event.preventDefault()
    addUser();
});

function showUserList() {
    // Скрываем форму создания нового пользователя
    document.getElementById('createUserForm').style.display = 'none';
    // Показываем таблицу с пользователями (или другие элементы, которые вы хотите скрыть)
    document.getElementById('userTable').style.display = 'table';

    document.getElementById('userInfoTable').style.display = 'none';
}

    document.getElementById('allUsers').addEventListener('click', showUserList);
    // Обработчик события для кнопки "Создать пользователя"
    document.getElementById('newUserLink').addEventListener('click', showCreateUserForm);
