export function validateAuth({ type = "register", name, email, password, confirmPassword }) {
  const errors = {}

  if (type === 'register') {
    // Name validation
    if (!name) {
      errors.name = "Name is required"
    } else if (name.length < 3) {
      errors.name = "Name must be at least 3 characters"
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm Password is required"
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match"
    }
  }

  // Email validation (login & register)
  if (!email) {
    errors.email = "Email is required"
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Email is invalid"
  }

  // Password validation (login & register)
  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  return errors
}
