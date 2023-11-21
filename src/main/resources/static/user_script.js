

showUserPage();

console.log('Открыли UserPage')

const container = document.getElementById('watch_info_btn');
const anotherContainer = document.getElementById('usersNavigation');
// fetch('/api/admin/users/authenticatedUser')
fetch('/api/admin/users/authenticatedUser')
    .then(response => response.json())
    .then(authenticatedUser => {

        let navbarUsername = document.getElementById('navbar_username');
        navbarUsername.textContent = authenticatedUser.username + ' ' + authenticatedUser.surname;

        const link = document.createElement('a');
        link.classList.add('btn', 'btn-lg', 'btn-primary');
        link.textContent = 'Watch Info';

        link.addEventListener('click', () => {
            showInfo();
            showUserInfoTable(authenticatedUser);
        })

        const linkToUserPage = document.createElement('a');
        linkToUserPage.classList.add('btn', 'btn-primary', 'btn-block', 'mt-2');
        linkToUserPage.textContent = 'User Page';

        linkToUserPage.addEventListener('click', () => {
            showUserPage();
        })

        console.log(container);
        container.appendChild(link);
        anotherContainer.appendChild(linkToUserPage);
    })


function showUserPage() {
    document.getElementById('welcome_page').style.display = 'block';
    document.getElementById('user_interface').style.display = 'none';
}

function showInfo() {
    document.getElementById('welcome_page').style.display = 'none';
    document.getElementById('user_interface').style.display = 'block';
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
    // showUserList();
    window.location.href = "/";
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
