(function() {
$(document).ready(function() {
    var socket = io.connect();
    var searchTimeOut;

    var $username = null;

    //for modal
    var inModal = true;
    $(window).load(function() {
        $('#usernameModal').modal('show');
    });

    //grabs username
    $('#usernameSubmit').on('click', function() {
        getUsername();
    });

    function getUsername() {
        $username = $('#usernameField').val() !== '' ? $('#usernameField').val(): 'anonymous';
        $('#usernameField').val('');
    }

    function enterChatRoom() {
        if ($username !== null) {
            $('#usernameModal').modal('hide');
            inModal = false;
            socket.emit('init', $username);
        }
    }

    //checks to make sure username is submitted
    $('#closeModal').on('click', function() {
        enterChatRoom();
    });

    $(document).keypress(function(event) {
        //13 == enter key
        if (event.which === 13) {
            if (inModal) {
                getUsername();
                enterChatRoom();
            }else {
                sendMessage();
            }
        }
    });

    //for chat room

    //check for admin messages
    function checkPriorityMessages  () {
        $('#messages li').each(function() {
            if ($(this).hasClass('priority_0')) $(this).appendTo($(this).parent());
        });
    }

    //checks for typing
    var TIME_OUT = 1500;
    $('#messageField').on('keypress', function(event) {
        checkTyping();
    });

    function checkTyping() {
        socket.emit('isTyping', true);

        if (searchTimeOut !== void 0) clearTimeout(searchTimeOut);

        searchTimeOut = setTimeout(function() {
            socket.emit('isTyping', false);
        }, TIME_OUT);
    }

    function sendMessage() {
        var msg = $('#messageField').val();

        if (msg !== '') {
            $('#messageField').val('');

            socket.emit('msg', {
                username: $username,
                message: msg,
                admin: false,
                priority: 1
            });
        }
    }

    function addMessage(data) {
        var $li = data.admin ? $('<li>').append(data.message): $('<li>').append(data.username + ': ' + data.message);
        if (data.priority === 0) $li.addClass('priority_0');

        $('#messages').append($li);
        checkPriorityMessages();
    }

    function removeMessage(idString) {
        var removalIndex = -1;
        var canRemove = true;

        while (canRemove) {
            $('#messages li').each(function() {
                if ($(this).text() === idString) removalIndex = $(this).index();
            });
            if (removalIndex >= 0) $('#messages li').eq(removalIndex).remove();
            else canRemove = false;
            removalIndex = -1;
        }
    }

    $('#messageSubmit').on('click', function() {
        sendMessage();
    });

    socket.on('msg', function(data) {
        addMessage(data);
    });

    socket.on('alertMsg', function(data) {
        if (data.username !== $username) {
            removeMessage(data.message);
            addMessage(data);
        }
    });

    socket.on('removeMsg', function(data) {
        removeMessage(data.message);
    });

});
}).call(this);
