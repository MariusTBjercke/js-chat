let chat = {
    app: {
        currentUser: '',
        currentPage: '',
    },

    input: {

        login: {
            username: '',
        },

        keysPressed: [],

    },

    data: {

        pages: [
            {
                name: 'frontpage',
                requiresAuth: true,
            },
            {
                name: 'login',
                requiresAuth: false,
            },
        ],

    }
};

export { chat }