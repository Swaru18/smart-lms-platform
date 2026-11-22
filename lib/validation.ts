const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string) {
  if (!EMAIL.test(email.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include a letter and a number.";
  return null;
}

export function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    mixed: /[A-Za-z]/.test(password) && /\d/.test(password),
  };
}

export function validateRegistration(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
  role: string;
}) {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 2) errors.name = "Enter your full name.";
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  const password = validatePassword(input.password);
  if (password) errors.password = password;
  if (input.password !== input.confirm) errors.confirm = "Passwords do not match.";
  if (input.role !== "learner" && input.role !== "instructor") errors.role = "Choose student or instructor.";
  if (!input.terms) errors.terms = "Accept the terms to create an account.";
  return errors;
}
