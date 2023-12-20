export function validateLogin(input) {
  const validationErrors = {};

  if (!("username" in input) || input["username"].length == 0) {
    validationErrors["username"] = "cannot be blank";
  } else {
    if (
      "username" in input &&
      !input["username"].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      validationErrors["username"] = "is invalid";
    }
  }

  if (!("password" in input) || input["password"].length == 0) {
    validationErrors["password"] = "cannot be blank";
  }

  return validationErrors;
}