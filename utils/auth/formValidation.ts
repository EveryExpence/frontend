export const validateEmail = (email: string) => {
    if (!email || !email.trim()) {
        return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email must be valid';
    }
    return null;
};

export const validatePassword = (password: string) => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8 || password.length > 64) {
        return 'Password must be between 8 and 64 characters';
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/;
    if (!passwordRegex.test(password)) {
        return 'Requires at least 1 digit, 1 lowercase, and 1 uppercase';
    }
    return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
};