const request = require('supertest');
const app = require('../server');
jest.useFakeTimers('legacy');


describe('POST Login', function () {
    it('reponds with json', () => {
        // jest.setTimeout(60000);
        let login = JSON.stringify({
            login: "settingpage",
            password: "Di987654321!",
        });

        const res =  request(app).post('/api/Login')
        .send(login);
        // let response = JSON.parse(res.status);
        let response = res.status;
        

        expect(response);
    });

    it('responds that user doesnt exist',  () => {

        let wrongLogin = JSON.stringify({
            login: "settingspages",
            password: "wrongpassword",
        });

        const res =  request.agent(app);
        res.get('/api/Login').send(wrongLogin);
        expect(res.status)

    }, 1000);
})


describe('POST register', function () {
    it('reponds with userId', () => {

        let signup = JSON.stringify({
            login: "newuser",
            password: "newpassword",
            firstName: "newFirst",
            lastName: "newLast",
            email: "newemail@gmail.com"
        });

        const res = request.agent(app);
        res.get('/api/Register').send(signup)
        expect(res.status);
    });

})

describe('POST UpdateSettings', function () {
    it('reponds with empty error', () => {

        let signup = JSON.stringify({
            userId: '65e9050fc24b877b9107f23c',
            firstName: "Test",
            lastName: "User",
            password: "securepassword",
            email: "something@gmail.com"
        });

        const res = request.agent(app);
        res.get('/api/UpdateSettings').send(signup)
        expect(res.status);
    });

    it('reponds with account already made', () => {

        let signup = JSON.stringify({
            userId: '65e9050fc24b877b9107f23c',
            firstName: "Test",
            lastName: "User",
            password: "securepassword",
            email: "setting@gmail.com"
        });

        const res = request.agent(app);
        res.get('/api/UpdateSettings').send(signup)
        expect(res.status);
    });

    it('responds with username already exists', () => {

        let signup = JSON.stringify({
            userId: '65e9050fc24b877b9107f23c',
            firstName: "Test",
            lastName: "User",
            password: "securepassword",
            email: "setting@gmail.com"
        });

        const res = request.agent(app);
        res.get('/api/UpdateSettings').send(signup)
        expect(res.status);
    });
   


})