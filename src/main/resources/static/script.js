// script.js

//===========================================================================

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
                container.appendChild(link);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

//===========================================================================
// тут использовать данные аутентифицированного пользователя.
// TODO
fetch('/api/user/2')
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

function addUser() {

    const newUsername = document.getElementById('newUsername').value;
    const newSurname = document.getElementById('newSurname').value;
    const newPassword = document.getElementById('newPassword').value;

    const selectedRoles = Array.from(document.getElementById('newRole').selectedOptions)
        .map(option => parseInt(option.value));

    const newUser = {
        username: newUsername,
        surname: newSurname,
        password: newPassword,
        roles: selectedRoles
    };
    console.log('New user created: ' + newUser)
    fetch(`/api/admin/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
    })
        .then(response => response.json())
        .then(addedUser => {
            console.log('Created user added to DB. User : ', addedUser);
            const tableBody = document.querySelector('#userTable tbody');

            const row = tableBody.insertRow()
            row.id = `userRow-${addedUser.id}`;
            row.insertCell(0).textContent = addedUser.username;
            row.insertCell(1).textContent = addedUser.surname;
            row.insertCell(2).textContent = addedUser.id;

            const roles = addedUser.roles.map(roleObject => roleObject.role).join(', ');
            row.insertCell(3).textContent = roles;

            updateListUserTable(addedUser.id);

            const container = document.getElementById('usersNavigation');

            const link = document.createElement('a');
            link.id = `userLink-${addedUser.id}`;
            link.classList.add('btn', 'btn-primary', 'btn-block', 'mt-2');
            link.textContent = addedUser.username + ' ' + addedUser.surname;

            container.appendChild(link);

            showUserList();
        })


}

async function deleteUser(user) {
    try {
        const response = await fetch(`/api/user/${user.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        const deletedUser = await response.json();
        console.log('User deleted', deletedUser);

        const link = document.getElementById(`userLink-${deletedUser.id}`);
        const tableRow = document.getElementById(`userRow-${deletedUser.id}`);

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

function updateListUserTable(id) {
    const userTable = document.getElementById('userTable');
    const tbody = userTable.querySelector('tbody');

    fetch(`/api/user/${id}`)
        .then(response => response.json())
        .then(user => {
            const row = `<tr>
                                <td>${user.username}</td>
                                <td>${user.surname}</td>
                                <td>${user.id}</td>
                                <td>${user.roles.map(roleObject => roleObject.role).join(', ')}</td>
                                <td>Some additional info</td>
                            </tr>`;

            tbody.innerHTML += row;

            userTable.style.display = 'table';
            document.getElementById('createUserForm').style.display = 'none';
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function showUserInfoTable(user) {
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

        console.log('Edit button clicked for user ID:', user.id);
    });

    editSub.addEventListener('click', () => {
        saveChanges();
    })

    const deleteButton = tbody.querySelector('.deleteBtn');
    const deleteSub = document.getElementById('deleteSub');

    // Удаляем существующие обработчики событий, если они есть
    deleteButton.removeEventListener('click', deleteButtonClickHandler);
    deleteSub.removeEventListener('click', deleteSubClickHandler);

    // Добавляем новые обработчики событий
    deleteButton.addEventListener('click', deleteButtonClickHandler);
    deleteSub.addEventListener('click', deleteSubClickHandler);

    function deleteButtonClickHandler() {
        document.getElementById('DeleteUserForm').style.display = 'block';
        fillDeleteForm(user);
        console.log('Delete button for user by ID', user.id);
    }

    async function deleteSubClickHandler() {
        await deleteUser(user);
        console.log('Deletion submit of user : ', user);
    }
}

//===========================================================================
// Добавление нового пользователя

function showCreateUserForm() {
    // Показываем форму создания нового пользователя
    document.getElementById('createUserForm').style.display = 'block';
    // Скрываем таблицу с пользователями (или другие элементы, которые вы хотите скрыть)
    document.getElementById('userTable').style.display = 'none';

    document.getElementById('userInfoTable').style.display = 'none';

    const newSubBtn = document.getElementById('newSub');
    newSubBtn.addEventListener('click', () => {
        addUser();
    })
}

function showUserList() {
    // Скрываем форму создания нового пользователя
    document.getElementById('createUserForm').style.display = 'none';
    // Показываем таблицу с пользователями (или другие элементы, которые вы хотите скрыть)
    document.getElementById('userTable').style.display = 'table';

    document.getElementById('userInfoTable').style.display = 'none';
}

//eventlistener для обработки запроса при нажатии на кнопку
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('allUsers').addEventListener('click', showUserList);

    // Обработчик события для кнопки "Создать пользователя"
    document.getElementById('newUserLink').addEventListener('click', showCreateUserForm);
});
