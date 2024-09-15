// Import Jest explicitly for ES modules
import { jest } from '@jest/globals';
import { register, login, logout } from '../controllers/auth.controller';

describe('Auth Controller', () => {

    let req, res;

    beforeEach(() => {
        req = {
            body: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            }
        };
        res = {
            send: jest.fn(),
            json: jest.fn(),
            status: jest.fn(() => res) // Chainable method
        };
        console.log = jest.fn();  // Mocking console.log
    });

    it('should handle register function', () => {
        register(req, res);
        expect(console.log).toHaveBeenCalledWith(req.body);
    });

    it('should handle login function', () => {
        login(req, res);
        expect(console.log).toHaveBeenCalledWith(req.body);
    });

    it('should handle logout function', () => {
        logout(req, res);
        expect(res.send).toHaveBeenCalledWith('Logout');
    });
});