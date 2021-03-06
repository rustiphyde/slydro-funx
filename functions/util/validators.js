const isEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(regEx)) return true;
	else return false;
};

const isEmpty = (string) => {
	if (string.trim() === "") return true;
	else return false;
};

exports.validateSignupData = (data) => {
	let errors = {};

	if (isEmpty(data.email)) {
		errors.email = "Field must not be empty";
	} else if (!isEmail(data.email)) {
		errors.email = "Field value must be a valid email address";
	}

	if (isEmpty(data.password)) errors.password = "Field must not be empty";
	if (data.confirmPassword !== data.password)
		errors.confirmPassword = "Password fields must match";
	if (isEmpty(data.alias)) errors.falias = "Field must not be empty";

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false,
	};
};

exports.validateLoginData = data => {
    let errors = {};
  
    if (isEmpty(data.email)) errors.email = "Field must not be empty";
    if (isEmpty(data.password)) errors.password = "Field must not be empty";
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  };

  exports.validateResetData = data => {
    let errors = {};
  
    if (isEmpty(data.email)) errors.email = "Field must not be empty";
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  };
